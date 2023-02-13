const async = require('async')
const express = require('express')
const randomID = require('uuid/v4')
var router = express.Router()
const all_connected_clients = require('./../SocketConnections')
const all_client_pc_id = require('./../all_client_pc_id')

//Controller
const Organik = require("../models/organik.model")

function loginSuccess(req, res, org) {
  console.log(org.nmjab)
  if (!/Kepala|Kasi|Koordinator|Koorsi/i.test(org.nmjab)) {
    res.end('422')
    return;
  } else if (/ipds|pengolahan/i.test(org.nmjab)) {
    res.cookie('seksi', 'IPDS')
  } else if (/sosial/i.test(org.nmjab)) {
    res.cookie('seksi', 'Sosial')
  } else if (/neraca|nerwilis/i.test(org.nmjab)) {
    res.cookie('seksi', 'Nerwilis')
  } else if (/produksi/i.test(org.nmjab)) {
    res.cookie('seksi', 'Produksi')
  } else if (/distribusi/i.test(org.nmjab)) {
    res.cookie('seksi', 'Distribusi')
  } else if (/tu|tata|bendahara/i.test(org.nmjab)) {
    res.cookie('seksi', 'Tata Usaha')
  } else if (/ksk|koordinator/i.test(org.nmjab)) {
    res.cookie('seksi', 'KSK')
  } else if (/kepala\sbps|kepala\sbadan/i.test(org.nmjab)) {
    res.cookie('seksi', 'Kepala BPS Kab')
  } else {
    res.cookie('seksi', 'Lainnya')
  }  
  const pc_id = randomID()
  res.cookie('pc_id', pc_id)
  all_client_pc_id[org._id] = pc_id;
  res.cookie('jabatan', org.nmjab)
  res.cookie('organik_id_', org._id)
  res.cookie('organik_nama', org.nama)
  res.cookie('tahun_anggaran', req.body.tahun_anggaran)
  res.end('200');
}

function login(req, res) {
  Organik.findOne({ $or: [{ username: req.body.username }, { niplama: `3400${req.body.username}` }], 'password': req.body.password }, (err, org) => {
    if (org) {
      // let isLoginedTask = []
      // for (let organik_id in all_connected_clients) {
      //   // check also if property is not inherited from prototype
      //   if (all_connected_clients.hasOwnProperty(organik_id)) {
      //     for (let io_id in all_connected_clients[organik_id]) {
      //       // check also if property is not inherited from prototype
      //       if (all_connected_clients[organik_id].hasOwnProperty(io_id)) {
      //         isLoginedTask.push((c_cb) => {
      //           all_connected_clients[organik_id][io_id].emit('api.login/c/doYouHaveLoginSomewhere', org._id, (answer) => {
      //             if (answer.type === 'error') {
      //               c_cb(answer, null)
      //             } else c_cb(null, answer)
      //           })
      //         })
      //       }
      //     }
      //   }
      // }
      // if (isLoginedTask.length) {
      //   async.auto(isLoginedTask, (err, final) => {
      //     if (!err) {
      //       loginSuccess(req, res, org)
      //     } else {
      //       res.end(err.data)
      //     }
      //   })
      // } else {
        loginSuccess(req, res, org)
      // }
    }
    else res.end('422')
  })
}

function out(req, res) {
  res.clearCookie('pc_id');
  res.clearCookie('jabatan');
  res.clearCookie('seksi');
  res.clearCookie('organik_id_');
  res.clearCookie('organik_nama');
  res.clearCookie('tahun_anggaran');
  res.redirect('/login');
}

router.post("/", login)
router.get("/out", out)

module.exports = router;