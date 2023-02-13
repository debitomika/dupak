const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const xlsx = require("node-xlsx").default;
const XlsxPopulate = require('xlsx-populate');
// const dir = './Draft Sampel'
const main_dir = 'input'
const dir = `./${main_dir}`
// const master = './lfsp2020_dsbs_7404_20220412.xlsx'
const master = './draft.xlsx'
const result = './draft1.xlsx'

let docs = {}

function readxlsx() {
    const data = xlsx.parse(master);
    XlsxPopulate.fromFileAsync(master)
        .then(workbook => {
            data[0].data.forEach((row, i) => {
                const kec = row[1].substring(4, 7)
                const desa = row[1].substring(7, 10)
                const bs = row[1].substring(10, 15)
                if (i > 0) {
                    if (docs[kec]) {
                        if (docs[kec][desa]){
                            if(docs[kec][desa][bs]){
                                if(workbook.sheet(0).cell(`H${i+1}`).value()){
                                    workbook.sheet(0).cell(`H${i+1}`).value('doubled drafted')
                                } else {
                                    workbook.sheet(0).cell(`H${i+1}`).value('drafted tahap 1')
                                    console.log('7404',kec,desa,bs,': drafted tahap 1');
                                }
                            }
                        }
                    }
                }
            })
            workbook.toFileAsync(result);
        }).then(dataa => {
            //done
            console.log(' Created.');
        })
}

function readPdf() {
    fs.readdir(dir, function (err, files) {
        files.forEach((docName, i) => {
            const kec = docName.substring(18, 21)
            const desa = docName.substring(22, 25)
            if (!docs[kec]) docs[kec] = {}
            if (!docs[kec][desa]) docs[kec][desa] = {}
            const file = `${path.join(__dirname, main_dir,docName)}`;
            let dataBuffer = fs.readFileSync(file);
            pdf(dataBuffer).then(function (data) {
                const info = data.text.match(/0\d{2}B/g)
                if (info) {
                    info.forEach((bs) => {
                        if (!docs[kec][desa][bs]) {
                            docs[kec][desa][bs] = true
                        }
                    })
                    // console.log(kec, info.filter(onlyUnique));
                    // const newName = `LFP2022.DSRT.7404 ${kec} ${desa} ${info.filter(onlyUnique).join(" ")}.PDF`
                    // fs.renameSync(file,`${path.join(__dirname, 'Draft Sampel',newName)}`)
                }
            })
        })
    })
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

readPdf()
setTimeout(() => {
    readxlsx()
}, 5000)