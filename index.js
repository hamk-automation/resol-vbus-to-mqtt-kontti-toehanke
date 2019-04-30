const vbus = require('resol-vbus')
const mqtt = require('async-mqtt');
const fs = require('fs')

const resolDataMap = JSON.parse(fs.readFileSync('live-data.json'))
var resolSchema = {
    "VV1_TE009": resolDataMap[7].name,
    "VV1_TE010": resolDataMap[1].name,
    "VV2_TE011": resolDataMap[2].name,
    "VV2_TE012": resolDataMap[3].name,
    "VV3_TE013": resolDataMap[4].name,
    "VV3_TE014": resolDataMap[5].name,
    "AK_TE001": resolDataMap[6].name,
    "AK_TE002": resolDataMap[0].name,
    "AK_TE003": resolDataMap[8].name,
    "AK_FE001": resolDataMap[12].name,
    "AK_FE002": resolDataMap[13].name,
    "AK_FE003": resolDataMap[14].name,
    "AK_PE001": resolDataMap[15].name,
    "AK_PE002": resolDataMap[16].name,
    "AKP01_TE004": resolDataMap[10].name,
    "AKP01_R": resolDataMap[17].name,
    "AKP01_PWM_A": resolDataMap[22].name,
    "AK_QQ": resolDataMap[39].name,
    "AK_QQ_D": resolDataMap[40].name,
    "AK_QQ_W": resolDataMap[41].name
}
function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
  }
// const varNameDictionary = JSON.parse(fs.readFileSync('modifiedTable.json'))
const hsc = new vbus.HeaderSetConsolidator({
    interval: 100,
});
const headerSet = new vbus.HeaderSet()
const toCamelCase = (str) => str.replace(/ [A-Za-z0-9 \-_.\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF]/g, (ltr, idx) => ltr.toUpperCase()).replace(/\s+/g, '').replace(/[.:]/g, '_');

const connection = new vbus.SerialConnection({
    path: '/dev/ttyACM0'
})
var spec = vbus.Specification.getDefaultSpecification();

var onPacket = function (packet) {
    var packetFields = spec.getPacketFieldsForHeaders([packet]);
    console.log(packetFields);
}


connection.on('packet', async (packet) => {
    headerSet.addHeader(packet)
    hsc.addHeader(packet)
});

hsc.on('headerSet', (headerSet) => {
    // writeHeaderSet(config.loggingFilename).then(null, err => {
    //     logger.error(err);
    // });
});

const generateJsonData = async function () {
    const packetFields = spec.getPacketFieldsForHeaders(headerSet.getSortedHeaders());

    const data = packetFields.map((pf) => {
        let obj = {}
        let timestamp = pf.packet.timestamp
        obj[getKeyByValue(resolSchema, pf.name)] = pf.rawValue
        // obj["unit"] = 0 || pf.formatTextValue().substring(pf.formatTextValue().lastIndexOf(' ') + 1)
        // obj["unit"] = obj["unit"] === '0%' ? '%' : obj["unit"]
        obj.timestamp = timestamp.getTime()
        // console.log('packet: ')
        // console.log(obj)
        return obj
    });
    // console.log(data)
    return data
}


var credentials = JSON.parse(fs.readFileSync('conf/credentials.json'))
var mqttOptions = JSON.parse(fs.readFileSync('conf/mqttCredentials.json'))
var mqttClient = mqtt.connect(credentials.mqttHost, mqttOptions)
var baseTopic = 'hamk/iot/valkeakoski/kontti/solar/solarHeat'

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

async function sendMqttData() {
    var resolData = await generateJsonData()
    resolData = resolData.filter(sensor => Object.keys(sensor)[0] !== 'undefined')
    var mqttMessageArray = resolData.map((sensor) => {
        let mqttMessage = {
            topic: baseTopic +
                '/' + Object.keys(sensor)[0],
            message: JSON.stringify(sensor)
        }
        if (Object.keys(sensor)[0] === 'undefined') return
        return mqttMessage
    })
    var mqttPush = await Promise.all(mqttMessageArray.map((mqttMessage) => {
        mqttClient.publish(mqttMessage.topic, mqttMessage.message).catch(error => error)
    }))
    // console.log(mqttPush)
    setTimeout(sendMqttData, 5000)

}