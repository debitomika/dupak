const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const xlsx = require("node-xlsx").default;
const XlsxPopulate = require('xlsx-populate');
const async = require('async');
// const dir = './Draft Sampel'
const dir = './input'
const dir2 = 'input'
const master = './lfsp2020_dsbs_7404_20220412.xlsx'
const result = './result.xlsx'

let docs = {}
const data = xlsx.parse(master);
kolaka = {}

data[0].data.forEach((row, i) => {
    if (i > 0) {
        const kec = row[1].substring(4, 7)
        const desa = row[1].substring(7, 10)
        const bs = row[1].substring(10, 15)
        if (!kolaka[kec]) kolaka[kec] = {
            name: row[2]
        }
        if (kolaka[kec]) {
            if (!kolaka[kec][desa]) kolaka[kec][desa] = {
                name: row[3].replace(/\s$/, "")
            }
        }
    }
})

// console.log(kolaka);
const task = []

function readPdf() {
    fs.readdir(dir, function (err, files) {
        files.forEach((docName, i) => {
            task.push((cb) => {
                const kec = docName.substring(18, 21)
                const desa = docName.substring(22, 25)
                if (!docs[kec]) docs[kec] = {}
                if (!docs[kec][desa]) docs[kec][desa] = {}
                const file = `${path.join(__dirname, dir2 , docName)}`;
                let dataBuffer = fs.readFileSync(file);
                pdf(dataBuffer).then(function (data) {
                    const info = data.text.match(/0[0|1|2]\dB/g)
                    if (info) {
                        const dirkec = `${path.join(__dirname, dir2, `${kec} ${kolaka[kec].name.replace(/\s$/, "")}`)}`
                        if (!fs.existsSync(dirkec)) {
                            fs.mkdirSync(dirkec);
                        }
                        const newName = `${desa} ${kolaka[kec][desa].name} ${info.filter(onlyUnique).join(" ")}.PDF`
                        // fs.renameSync(file, `${path.join(__dirname, dir2, newName)}`)
                        fs.renameSync(file, `${path.join(__dirname, dir2, `${kec} ${kolaka[kec].name.replace(/\s$/, "")}`,newName)}`)
                        console.log(file,' => ',newName);
                        cb(null, i+'ok')
                    } else{
                        console.log(file, info);
                        cb(null, i+'faults')
                    }
                })
            })
        })

        async.series(task, (err, result)=>{
            // console.log(err, result);
            console.log('Finish');
        })
    })
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

// readPdf()
setTimeout(() => {
    readPdf()
}, 5000)