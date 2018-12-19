var vbus = require('resol-vbus')
var fs = require('fs')
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
    console.log(await generateJsonData())
});

hsc.on('headerSet', (headerSet) => {
    // writeHeaderSet(config.loggingFilename).then(null, err => {
    //     logger.error(err);
    // });
});

connection.connect().then(() => {
    console.log('Connected!')
}, () => {
    console.log('Connection failed');
})

const generateJsonData = async function() {
    const packetFields = spec.getPacketFieldsForHeaders(headerSet.getSortedHeaders());

    const data = packetFields.map((pf) => {
        let obj = {}
        let timestamp = new Date()
        obj.id = pf.id
        obj[toCamelCase(pf.name)] = pf.rawValue
        obj["unit"] = 0 || pf.formatTextValue().substring(pf.formatTextValue().lastIndexOf(' ') + 1)
        obj.timestamp = timestamp.getTime()
        return obj
    });

    return data
}