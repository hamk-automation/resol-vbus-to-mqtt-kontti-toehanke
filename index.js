const vbus = require('resol-vbus')
const mqtt = require('async-mqtt');
const fs = require('fs')

const varNameDictionary = JSON.parse(fs.readFileSync('modifiedTable.json'))
const hsc = new vbus.HeaderSetConsolidator({
    interval: 100,
});
const headerSet = new vbus.HeaderSet()
const toCamelCase = (str) => str.replace(/ [A-Za-z0-9 \-_.\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF]/g, (ltr, idx) => ltr.toUpperCase()).replace(/\s+/g, '').replace(/[.:]/g, '_');

var connection = new vbus.TcpConnection({
    host: '172.17.171.22',
    password: 'admin2015',
    channel: 1, // only necessary if connected to a DL3
})
var spec = vbus.Specification.getDefaultSpecification();

var onPacket = function(packet) {
    var packetFields = spec.getPacketFieldsForHeaders([packet]);
    console.log(packetFields);
}


connection.on('packet', async(packet) => {
    headerSet.addHeader(packet)
    hsc.addHeader(packet)
});

hsc.on('headerSet', (headerSet) => {
    // writeHeaderSet(config.loggingFilename).then(null, err => {
    //     logger.error(err);
    // });
});

const generateJsonData = async function() {
    const packetFields = spec.getPacketFieldsForHeaders(headerSet.getSortedHeaders());

    const data = packetFields.map((pf) => {
        let obj = {}
        let timestamp = pf.packet.timestamp

        obj.id = pf.id
        if (varNameDictionary[pf.name] !== undefined) {
            obj[toCamelCase(varNameDictionary[pf.name].customName)] = pf.rawValue
        } else {
            obj[toCamelCase(pf.name)] = pf.rawValue
        }
        obj["unit"] = 0 || pf.formatTextValue().substring(pf.formatTextValue().lastIndexOf(' ') + 1)
        obj["unit"] = obj["unit"] === '0%' ? '%' : obj["unit"]
        obj.timestamp = timestamp.getTime()
            // console.log('packet: ')
            // console.log(obj)
        return obj
    });

    return data
}


var credentials = JSON.parse(fs.readFileSync('conf/credentials.json'))
var mqttOptions = JSON.parse(fs.readFileSync('conf/mqttCredentials.json'))
var mqttClient = mqtt.connect(credentials.mqttHost, mqttOptions)
var baseTopic = 'hamk/olk/solarHeat'

mqttClient.on("connect", () => {
    if (connection.connectionState !== 'CONNECTED') {
        var vbusConnection = connection.connect()
        vbusConnection.then(() => {
            console.log('Connected!')
            setTimeout(sendMqttData, 30000)
        }, () => {
            console.log('Connection failed');
        })
    }
})

function sendMqttData() {
    var resolData = generateJsonData()
    resolData.then((data) => {
        var mqttMessageArray = data.map((sensor) => {
            let mqttMessage = {
                topic: baseTopic +
                    '/' + sensor.id,
                message: JSON.stringify(sensor)
            }
            return mqttMessage
        })
        var mqttPush = Promise.all(mqttMessageArray.map((mqttMessage) => {
            mqttClient.publish(mqttMessage.topic, mqttMessage.message).catch(error => error)
        }))
        mqttPush.then((values) => {
            console.log(values)
            setTimeout(sendMqttData, 5000)
        })
    })
}