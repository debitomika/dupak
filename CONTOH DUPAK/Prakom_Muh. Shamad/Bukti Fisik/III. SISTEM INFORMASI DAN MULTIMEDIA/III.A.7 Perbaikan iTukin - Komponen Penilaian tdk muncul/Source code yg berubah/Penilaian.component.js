import { Col, Collapse, Row, Progress, Select, Typography, Button } from 'antd'
import moment from 'moment';
moment.locale('id');
import columns from './Penilaian.table.columns.component';
import tambahanColumns from "./Penilaian.tambahan.columns.component";
const { Option } = Select;

import dynamic from 'next/dynamic';
const TablePenilaian = dynamic(() => import("./Penilaian.table.component"));
const TablePenilaianTambahan = dynamic(() => import("./Penilaian.tambahan.table"));
const TablePenilaianTlpsw = dynamic(() => import("./Penilaian.tlpsw.component"));
const TablePenilaianDailyCuti = dynamic(() => import("./Penilaian.daily_cuti"));
const PenilaianTambahanDrawer = dynamic(() => import("./Penilaian.tambahan.drawer.component"));
import getPoinPenilaian from "./Penilaian.function/getPoinPenilaian";
import onClickKirimPenilaianTambahan from "./Penilaian.function/onClickKirimPenilaianTambahan";
import getSemuaOrganik from "./Penilaian.function/getSemuaOrganik";
import onClickKirimPenilaian from "./Penilaian.function/onClickKirimPenilaian";
import onClickKirimAbsPenilaian from "./Penilaian.function/onClickKirimAbsPenilaian";
import onClickKirimDailyCutiPenilaian from "./Penilaian.function/onClickKirimDailyCutiPenilaian";
import getTambahanKeg from "./Penilaian.function/getTambahanKeg";

const { Panel } = Collapse;

const genTitle = (title, progr, key, stateKey) => (
    <span>{key === stateKey ? <strong>{title}</strong> : title} <span style={{ float: "Right", width: 100 }}><Progress percent={progr} size="small" /></span></span>
);

export default class Penilaian extends React.Component {
    state = {
        activeKey: undefined,
        month: moment().month(),
        seksi: "--seksi--",
        semua_kegiatan: [],
        semua_tambahan_kegiatan: [],
        semua_organik: [],
        showTambahanPenilaianDrawer: false
    }

    onCloseTambahanDrawer = () => {
        this.setState({
            showTambahanPenilaianDrawer: false,
        });
    };

    showTambahanDrawer = () => {
        this.setState({
            showTambahanPenilaianDrawer: true,
        });
    };

    onAfterChange = (index, value, data, currentRow) => {
        const newData = [...data]
        newData.forEach((row, i) => {
            if (row.key === currentRow.key) {
                row.kinerja[index] = value;
            }
        })
        this.setState({ datax: [...newData] });
    }

    getKegiatan = (month, seksi) => {
        this.props.socket.emit(
            'api.socket.penilaian/s/getPoinPenilaian',
            { month, seksi },
            (response) => {
                getPoinPenilaian(response, this.props, this.state.seksi, (result) => {
                    this.setState(result)
                })
            }
        )
    }

    getOrganik = (month, seksi, tahun_anggaran) => {
        this.props.socket.emit(
            'api.socket.penilaian/s/getSemuaOrganik',
            { month },
            (response) => {
                getSemuaOrganik(response, this.props, month, (result) => {
                    this.setState(result)
                })
            }
        )
    }

    onClickKirimPenilaian = (key, kinerja) => {
        this.props.socket.emit(
            'api.socket.penilaian/s/onClickKirimPenilaian',
            { _id: key, kinerja },
            (response) => {
                onClickKirimPenilaian(
                    response,
                    this.state,
                    key,
                    this.props,
                    (result) => this.setState(result)
                );
            })
    }

    onClickEditPenilaian = (key) => {
        this.setState({
            semua_kegiatan: [
                ...this.state.semua_kegiatan.map(keg => {
                    return {
                        title: keg.title,
                        data: keg.data.map(k => {
                            if (k.key === key) {
                                return { ...k, kinerja_committed: false }
                            } else return k;
                        })
                    }
                })
            ]
        })
    }

    onChangeAbsensi = (tl_psw, index, value, currentRow) => {
        const newData = [...this.state.semua_organik]
        newData.forEach((organik, i) => {
            if (organik._id === currentRow._id) {
                newData[i][tl_psw][index] = value;
            }
        })
        this.setState({ semua_organik: [...newData] });
    }

    onClickKirimAbsPenilaian = (_id, tl, psw, daily_cuti, ckp) => {
        this.props.socket.emit(
            'api.socket.penilaian/s/onClickKirimAbsPenilaian',
            { _id, tl, psw, daily_cuti, ckp },
            (response) => {
                onClickKirimAbsPenilaian(
                    response,
                    this.state,
                    _id,
                    this.props,
                    (result) => this.setState(result)
                );
            })
    }

    onClickEditAbsPenilaian = (_id) => {
        this.setState({
            semua_organik: [
                ...this.state.semua_organik.map(organik => {
                    return {
                        ...organik,
                        tl: _id !== organik._id ? organik.tl : { ...organik.tl, absensi_committed: false },
                        psw: _id !== organik._id ? organik.psw : { ...organik.psw, absensi_committed: false }
                    }
                })
            ]
        })
    }

    onChangeDailyCuti = (daily_cuti, index, value, currentRow) => {
        const newData = [...this.state.semua_organik]
        newData.forEach((organik, i) => {
            if (organik._id === currentRow._id) {
                newData[i][daily_cuti][index] = value;
            }
        })
        this.setState({ semua_organik: [...newData] });
    }

    onClickKirimDailyCutiPenilaian = (_id, daily_cuti) => {
        this.props.socket.emit(
            'api.socket.penilaian/s/onClickKirimDailyCutiPenilaian',
            { _id, daily_cuti },
            (response) => {
                onClickKirimDailyCutiPenilaian(
                    response,
                    this.state,
                    _id,
                    this.props,
                    (result) => this.setState(result)
                );
            })
    }

    onClickEditDailyCutiPenilaian = (_id) => {
        this.setState({
            semua_organik: [
                ...this.state.semua_organik.map(organik => {
                    return {
                        ...organik,
                        daily_cuti: _id !== organik._id ? organik.daily_cuti : { ...organik.daily_cuti, d_c_committed: false }
                    }
                })
            ]
        })
    }

    onClickKirimPenilaianTambahan = (nip, id_keg_tamb, kinerja) => {
        this.props.socket.emit(
            'api.socket.penilaian/s/onClickKirimPenilaianTambahan',
            { _id: nip, id_keg_tamb, kinerja },
            (response) => {
                onClickKirimPenilaianTambahan(
                    response,
                    this.state.semua_organik,
                    nip,
                    id_keg_tamb,
                    kinerja,
                    this.props,
                    (result) => this.setState(result)
                );
            })
    }

    onClickEditPenilaianTambahan = (nip, id_keg_tamb) => {
        this.setState({
            semua_organik: [
                ...this.state.semua_organik.map(organik => {
                    if (organik._id !== nip) return organik;
                    else return {
                        ...organik,
                        tambahan_keg: organik.tambahan_keg.map(keg => {
                            if (keg._id !== id_keg_tamb) return keg;
                            else return {
                                ...keg,
                                kinerja_committed: false
                            }
                        })
                    }
                })
            ]
        })
    }

    UNSAFE_componentWillReceiveProps = (prevProps) => {
        const { seksi, tahun_anggaran } = prevProps.active_user;
        if (seksi !== this.state.seksi) {
            if (seksi && tahun_anggaran) {
                this.setState({ seksi: seksi ? (seksi.match(/Kepala\sBPS\sKab/i) ? "Tata Usaha" : seksi) : seksi }, () => {
                    setTimeout(() => {
                        let { month } = this.state;
                        if (+tahun_anggaran < moment().year()) {
                            month = 11;
                            this.setState({ month })
                        } else if( moment().date() < 10 ){
                            month = moment().month() - 1;
                            this.setState({ month })
                        }
                        this.getKegiatan(month, seksi ? (seksi.match(/Kepala\sBPS\sKab/i) ? "Tata Usaha" : seksi) : seksi);
                        this.getOrganik(month, seksi ? (seksi.match(/Kepala\sBPS\sKab/i) ? "Tata Usaha" : seksi) : seksi, tahun_anggaran);
                    }, 100)
                })
            }
        }
    }

    render() {
        const { activeKey, seksi, month, semua_kegiatan, semua_organik, showTambahanPenilaianDrawer } = this.state;
        const { active_user } = this.props;
        const semua_tambahan_kegiatan = getTambahanKeg(month, seksi, semua_organik, active_user.tahun_anggaran);
        return (
            <React.Fragment>
                <Row style={{ marginBottom: 7 }} gutter={[3, 0]} type="flex" align="middle">
                    <Col xs={3}>
                        <strong>Tunjangan Kinerja:</strong>
                    </Col>
                    <Col xs={4}>
                        <Select
                            placeholder="Pilih salah satu..."
                            value={month}
                            onChange={(v) => this.setState({ month: v }, () => {
                                const { month, seksi } = this.state;
                                this.getKegiatan(month, seksi);
                                this.getOrganik(month, seksi, active_user.tahun_anggaran);
                            })}
                            style={{ width: "100%" }}
                        >
                            {[
                                'Januari', 'Februari', 'Maret', 'April',
                                'Mei', 'Juni', 'Juli', 'Agustus',
                                'September', 'Oktober', 'November', 'Desember'
                            ].map((m, i) => (<Option value={i} key={i}><strong>{m}</strong></Option>))}
                        </Select>
                    </Col>
                    <Col xs={1} style={{ marginLeft: 40 }}>
                        <strong>Seksi:</strong>
                    </Col>
                    <Col xs={4}>
                        <Select
                            placeholder="Pilih salah satu..."
                            disabled={active_user.seksi ? !active_user.seksi.match(/Kepala\sBPS\sKab|Tata Usaha/i) : true}
                            value={seksi}
                            onChange={(v) => this.setState({ seksi: v }, () => {
                                const { month, seksi } = this.state;
                                this.getKegiatan(month, seksi);
                                this.getOrganik(month, seksi, active_user.tahun_anggaran);
                            })}
                            style={{ width: "100%" }}
                        >
                            {[
                                'Tata Usaha', 'Sosial', 'Produksi',
                                'Distribusi', 'Nerwilis', 'IPDS'
                            ].map((s, i) => (<Option value={s} key={i}><strong>{s}</strong></Option>))}
                        </Select>
                    </Col>
                    <Col xs={4} push={2}>
                        <Button type="primary" icon="plus" onClick={this.showTambahanDrawer}>Poin Penilaian Tambahan</Button>
                    </Col>
                    <Col xs={4} push={2}>
                        <a href='/summary'>
                            <Button type="default">Lihat Hasil Penilaian</Button>
                        </a>
                    </Col>
                </Row>
                <Typography style={{ textAlign: "center" }}>
                    <Typography.Title level={4}>Penilaian Tunjangan Kinerja {`${seksi ? (seksi.match(/Tata Usaha/) ? 'Sub Bagian ' : 'Seksi ') : 'Seksi'} ${seksi ? (seksi.match(/Tata Usaha|IPDS/) ? '' : 'Statistik ') : 'Statistik '} ${seksi}`}</Typography.Title>
                </Typography>
                <Row>
                    <Col sm={24}>
                        <Collapse
                            accordion={true}
                            // activeKey={activeKey}
                            onChange={(activeKey) => this.setState({ activeKey })}
                            expandIconPosition={"left"}
                        >
                            {seksi === "Tata Usaha" ? <Panel
                                header={
                                    genTitle(`Absensi, CKP T/R, dan Cuti ${moment().year(active_user.tahun_anggaran).month(month).format("MMMM YYYY")}`,
                                        Math.round((semua_organik.reduce((a, b) => (a + (b.tl.absensi_committed ? 1 : 0)), 0)) / semua_organik.length * 100),
                                        "absensi",
                                        activeKey)}
                                key="absensi">
                                <TablePenilaianTlpsw
                                    data={semua_organik}
                                    onClickEditPenilaian={this.onClickEditAbsPenilaian}
                                    onClickKirimPenilaian={this.onClickKirimAbsPenilaian}
                                    onChangeAbsensi={this.onChangeAbsensi}
                                    onChangeDailyCuti={this.onChangeDailyCuti} />
                            </Panel> : null}
                            {seksi === "Tata Usaha" ? <Panel
                                header={
                                    genTitle(`Daily Activity ${moment().year(active_user.tahun_anggaran).month(month).format("MMMM YYYY")}`,
                                        Math.round((semua_organik.reduce((a, b) => (a + (b.daily_cuti.d_c_committed ? 1 : 0)), 0)) / semua_organik.length * 100),
                                        "daily_cuti",
                                        activeKey)}
                                key="daily_cuti">
                                <TablePenilaianDailyCuti
                                    data={semua_organik}
                                    onClickEditPenilaian={this.onClickEditDailyCutiPenilaian}
                                    onClickKirimPenilaian={this.onClickKirimDailyCutiPenilaian}
                                    onChangeDailyCuti={this.onChangeDailyCuti} />
                            </Panel> : null}
                            {semua_kegiatan.length ? semua_kegiatan.map(keg => <Panel header={genTitle(keg.title, Math.round((keg.data.reduce((a, b) => (a + (b.kinerja_committed ? 1 : 0)), 0)) / keg.data.length * 100), keg.title, activeKey)} key={keg.title}>
                                <TablePenilaian data={keg.data} columns={columns(keg.data, this.onAfterChange, this.onClickEditPenilaian, this.onClickKirimPenilaian)} />
                            </Panel>) : <Panel disabled={true} header="Tidak ada kegiatan perjalanan dinas" key="none">
                                    Tidak ada kegiatan perjalanan dinas
                                </Panel>}
                            {semua_tambahan_kegiatan.length ? semua_tambahan_kegiatan.map(keg => <Panel header={genTitle(keg.title, Math.round((keg.data.reduce((a, b) => (a + (b.kinerja_committed ? 1 : 0)), 0)) / keg.data.length * 100), keg.title, activeKey)} key={keg.title}>
                                <TablePenilaianTambahan data={keg.data} columns={tambahanColumns(keg.data, this.onAfterChange, this.onClickEditPenilaianTambahan, this.onClickKirimPenilaianTambahan)} />
                            </Panel>) : null}
                        </Collapse>
                    </Col>
                </Row>
                <PenilaianTambahanDrawer
                    showTambahanPenilaianDrawer={showTambahanPenilaianDrawer}
                    onCloseTambahanDrawer={this.onCloseTambahanDrawer}
                    month={month}
                    semua_organik={semua_organik}
                    semua_tambahan_kegiatan={semua_tambahan_kegiatan}
                    seksi={seksi}
                    getOrganik={this.getOrganik}
                    tahun_anggaran={active_user.tahun_anggaran}
                    {...this.props}
                />
            </React.Fragment>
        )
    }
}