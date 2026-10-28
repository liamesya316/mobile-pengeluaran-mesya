import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
} from 'react-native';

import TambahScreen from './tambah';
import DetailScreen from './detail';
import UbahScreen from './ubah';

// --- DATA AWAL & KONSTANTA ---

const INITIAL_TRANSACTIONS = [
  {
    id: '1',
    title: 'Makan siang',
    category: 'Makanan',
    time: 'Hari ini, 12:30',
    fullDate: '24 Okt 2023, 12:30',
    amount: 20000,
  },
  {
    id: '2',
    title: 'Bensin motor',
    category: 'Transportasi',
    time: 'Hari ini, 08:30',
    fullDate: '24 Okt 2023, 08:30',
    amount: 50000,
  },
  {
    id: '3',
    title: 'Kopi senja',
    category: 'Makanan',
    time: 'Kemarin, 17:15',
    fullDate: '23 Okt 2023, 17:15',
    amount: 18000,
  },
];

// --- SUB-KOMPONEN PRESENTASIONAL ---

const AppHeader = ({ onRefresh, hideRefreshBtn }) => (
  <View style={styles.headerRow}>
    <Text style={styles.appTitle}>Pengeluaran</Text>
    {!hideRefreshBtn && (
      <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
        <Text style={styles.refreshIcon}>↻</Text>
      </TouchableOpacity>
    )}
  </View>
);

const NotificationBanner = ({ message }) => (
  <View style={styles.notificationBanner}>
    <Text style={styles.notificationIcon}>☑</Text>
    <Text style={styles.notificationText}>{message}</Text>
  </View>
);

const TotalCard = ({ total }) => (
  <View style={styles.totalCard}>
    <Text style={styles.totalLabel}>TOTAL BULAN INI</Text>
    <Text style={styles.totalAmount}>
      Rp {total.toLocaleString('id-ID')}
    </Text>
  </View>
);

const SectionHeader = () => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>TRANSAKSI TERAKHIR</Text>
    <Text style={styles.sectionFilter}>Terbaru dahulu</Text>
  </View>
);

const TransactionItem = ({ item, onPress }) => (
  <TouchableOpacity
    activeOpacity={0.7}
    style={styles.transCard}
    onPress={() => onPress(item)}
  >
    <View>
      <Text style={styles.transTitle}>{item.title}</Text>
      <View style={styles.tagContainer}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{item.category}</Text>
        </View>
        <Text style={styles.transTime}>{item.time}</Text>
      </View>
    </View>
    <Text style={styles.transAmount}>
      Rp {item.amount.toLocaleString('id-ID')}
    </Text>
  </TouchableOpacity>
);

// Tampilan Kosong (13-daftar_kosong)
const EmptyState = ({ onCobaLagi }) => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIconCircle}>
      <Text style={styles.emptyIconText}>!</Text>
    </View>
    <Text style={styles.emptyTitle}>Belum ada catatan</Text>
    <Text style={styles.emptySubtitle}>
      Mulai catat pengeluaran harian Anda agar keuangan lebih terpantau.
    </Text>
    <TouchableOpacity style={styles.retryBtn} onPress={onCobaLagi}>
      <Text style={styles.retryBtnText}>Coba Lagi</Text>
    </TouchableOpacity>
  </View>
);

// Tampilan Gagal Memuat (14-gagal_memuat)
const FailedState = ({ onCobaLagi }) => (
  <View style={styles.failedContainer}>
    <View style={styles.failedCenterContent}>
      <View style={styles.failedIconCircleBg}>
        <View style={styles.failedIconCircleBorder}>
          <Text style={styles.failedIconText}>!</Text>
        </View>
      </View>
      <Text style={styles.failedTitle}>Gagal Terhubung</Text>
      <Text style={styles.failedSubtitle}>
        Gagal memuat data. Periksa koneksi internet Anda dan coba beberapa saat lagi.
      </Text>
    </View>

    <TouchableOpacity style={styles.retryBtnWithIcon} onPress={onCobaLagi}>
      <Text style={styles.retryBtnIcon}>↻</Text>
      <Text style={styles.retryBtnText}>Coba Lagi</Text>
    </TouchableOpacity>
  </View>
);

// Tampilan Data Tidak Ada (15-data_tidak_ada)
const NotFoundState = ({ onKembaliUtama }) => (
  <View style={styles.notFoundContainer}>
    {/* Header Atas */}
    <View style={styles.notFoundHeader}>
      <TouchableOpacity onPress={onKembaliUtama} style={styles.backBtnRow}>
        <Text style={styles.backArrow}>‹</Text>
        <Text style={styles.backText}>Kembali</Text>
      </TouchableOpacity>
    </View>

    {/* Konten Tengah */}
    <View style={styles.notFoundCenterContent}>
      <View style={styles.notFoundIconCircle}>
        <Text style={styles.notFoundIconText}>!</Text>
      </View>
      <Text style={styles.notFoundTitle}>Data Tidak Ditemukan</Text>
      <Text style={styles.notFoundSubtitle}>
        Detail transaksi yang Anda cari tidak tersedia atau telah dihapus.
      </Text>
    </View>

    {/* Tombol Bawah */}
    <TouchableOpacity style={styles.primaryBtn} onPress={onKembaliUtama}>
      <Text style={styles.primaryBtnText}>Kembali ke Utama</Text>
    </TouchableOpacity>
  </View>
);

const BottomActions = ({ onTambah, onMuatUlang }) => (
  <View style={styles.bottomActions}>
    <TouchableOpacity style={styles.addBtn} onPress={onTambah}>
      <Text style={styles.addBtnText}>+ Tambah Pengeluaran</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.reloadBtn} onPress={onMuatUlang}>
      <Text style={styles.reloadBtnText}>Muat Ulang</Text>
    </TouchableOpacity>
  </View>
);

// --- KOMPONEN UTAMA ---

export default function App() {
  // State Navigasi Antar Layar
  const [showTambah, setShowTambah] = useState(false);
  const [showUbah, setShowUbah] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // State Status Tampilan Beranda: 'data' | 'empty' | 'failed' | 'not_found'
  const [viewStatus, setViewStatus] = useState('data');

  // State Data Transaksi & Toast Notifikasi
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [notification, setNotification] = useState({
    visible: false,
    message: '',
  });

  // Helper Toast Notifikasi
  const triggerNotification = (message) => {
    setNotification({ visible: true, message });
    setTimeout(() => {
      setNotification({ visible: false, message: '' });
    }, 4000);
  };

  const clearNotification = () => {
    if (notification.visible) {
      setNotification({ visible: false, message: '' });
    }
  };

  // Kalkulasi Total Pengeluaran
  const totalPengeluaran = transactions.reduce((acc, curr) => acc + curr.amount, 0);

  // --- HANDLERS (LOGIKA AKSI & CRUD) ---

  const handleSimpanPengeluaran = (itemBaru) => {
    const newTransaction = {
      id: Date.now().toString(),
      title: itemBaru.title,
      category: itemBaru.category,
      time: 'Hari ini, 12:30',
      fullDate: '24 Okt 2023, 12:30',
      amount: itemBaru.amount,
    };

    setTransactions((prev) => [newTransaction, ...prev]);
    setViewStatus('data');
    setShowTambah(false);
    triggerNotification('Data berhasil disimpan');
  };

  const handleSimpanPerubahan = (updatedItem) => {
    setTransactions((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
    setShowUbah(false);
    setSelectedTransaction(null);
    triggerNotification('Data berhasil diubah');
  };

  const handleHapusPengeluaran = (id) => {
    const updated = transactions.filter((item) => item.id !== id);
    setTransactions(updated);
    if (updated.length === 0) {
      setViewStatus('empty');
    }
    setSelectedTransaction(null);
    triggerNotification('Data berhasil dihapus');
  };

  const handleMuatUlang = () => {
    setViewStatus('empty');
    clearNotification();
  };

  const handleEmptyRetry = () => {
    setViewStatus('failed');
    clearNotification();
  };

  // Pindah ke layar 15-data_tidak_ada saat tombol Coba Lagi di state 'failed' diklik
  const handleFailedRetry = () => {
    setViewStatus('not_found');
    clearNotification();
  };

  // Mengembalikan tampilan ke Beranda Utama dengan data awal
  const handleKembaliKeUtama = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setViewStatus('data');
    clearNotification();
  };

  // --- RENDERING TIAP HALAMAN (SCREEN ROUTING) ---

  if (showTambah) {
    return (
      <TambahScreen
        onBatal={() => setShowTambah(false)}
        onSimpan={handleSimpanPengeluaran}
      />
    );
  }

  if (showUbah) {
    return (
      <UbahScreen
        transaction={selectedTransaction}
        onBatal={() => setShowUbah(false)}
        onSimpanPerubahan={handleSimpanPerubahan}
      />
    );
  }

  if (selectedTransaction) {
    return (
      <DetailScreen
        transaction={selectedTransaction}
        onKembali={() => setSelectedTransaction(null)}
        onHapus={handleHapusPengeluaran}
        onUbah={() => setShowUbah(true)}
      />
    );
  }

  // Render Tampilan 15-data_tidak_ada secara penuh
  if (viewStatus === 'not_found') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAFBFD" />
        <NotFoundState onKembaliUtama={handleKembaliKeUtama} />
      </SafeAreaView>
    );
  }

  // --- TAMPILAN UTAMA BERANDA ---

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFBFD" />

      <AppHeader
        onRefresh={handleKembaliKeUtama}
        hideRefreshBtn={viewStatus === 'failed'}
      />

      {notification.visible && (
        <NotificationBanner message={notification.message} />
      )}

      {viewStatus === 'failed' ? (
        <FailedState onCobaLagi={handleFailedRetry} />
      ) : (
        <>
          <View style={styles.content}>
            <TotalCard total={viewStatus === 'empty' ? 0 : totalPengeluaran} />

            {viewStatus === 'data' && transactions.length > 0 ? (
              <>
                <SectionHeader />
                <FlatList
                  data={transactions}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TransactionItem
                      item={item}
                      onPress={(trans) => {
                        clearNotification();
                        setSelectedTransaction(trans);
                      }}
                    />
                  )}
                />
              </>
            ) : (
              <EmptyState onCobaLagi={handleEmptyRetry} />
            )}
          </View>

          {viewStatus === 'data' && transactions.length > 0 && (
            <BottomActions
              onTambah={() => {
                clearNotification();
                setShowTambah(true);
              }}
              onMuatUlang={handleMuatUlang}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

// --- STYLESHEET ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFD',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  refreshBtn: {
    padding: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#0A7365',
  },
  refreshIcon: {
    color: '#0A7365',
    fontSize: 16,
    fontWeight: 'bold',
  },
  notificationBanner: {
    backgroundColor: '#F0FDF4',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#DCFCE7',
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  notificationIcon: {
    color: '#16A34A',
    fontSize: 16,
    marginRight: 8,
    fontWeight: 'bold',
  },
  notificationText: {
    color: '#166534',
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  totalCard: {
    backgroundColor: '#0A7365',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  totalLabel: {
    color: '#E6F4F1',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  totalAmount: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  sectionFilter: {
    fontSize: 12,
    color: '#0A7365',
    fontWeight: '500',
  },
  transCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  transTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 6,
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 8,
  },
  tagText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  transTime: {
    fontSize: 11,
    color: '#94A3B8',
  },
  transAmount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
  },

  // STYLES EMPTY STATE (13-daftar_kosong)
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIconText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#475569',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  retryBtn: {
    backgroundColor: '#0A7365',
    borderRadius: 10,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  // STYLES FAILED STATE (14-gagal_memuat)
  failedContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  failedCenterContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  failedIconCircleBg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  failedIconCircleBorder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  failedIconText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  failedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
  },
  failedSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtnWithIcon: {
    backgroundColor: '#0A7365',
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryBtnIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    marginRight: 8,
    fontWeight: 'bold',
  },

  // STYLES DATA TIDAK ADA (15-data_tidak_ada)
  notFoundContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  notFoundHeader: {
    paddingTop: 16,
    paddingBottom: 12,
  },
  backBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 22,
    color: '#0A7365',
    marginRight: 6,
    fontWeight: 'bold',
    marginTop: -2,
  },
  backText: {
    fontSize: 15,
    color: '#0A7365',
    fontWeight: '600',
  },
  notFoundCenterContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  notFoundIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  notFoundIconText: {
    fontSize: 32,
    fontWeight: '500',
    color: '#475569',
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  notFoundSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  primaryBtn: {
    backgroundColor: '#0A7365',
    borderRadius: 10,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  // STYLES BOTTOM ACTIONS
  bottomActions: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 10,
  },
  addBtn: {
    backgroundColor: '#0A7365',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  reloadBtn: {
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  reloadBtnText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '600',
  },
});