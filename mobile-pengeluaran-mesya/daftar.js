import React, { memo, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// ---------------------------------------------------------------------------
// Sub-components (Memoized untuk mencegah re-render yang tidak perlu)
// ---------------------------------------------------------------------------

// 1. Header Utama Screen
const Header = memo(({ onRefresh }) => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>Pengeluaran</Text>
    <TouchableOpacity
      style={styles.refreshButton}
      onPress={onRefresh}
      activeOpacity={0.7}
      accessibilityLabel="Muat ulang data"
      accessibilityRole="button"
    >
      <Text style={styles.refreshIcon}>↻</Text>
    </TouchableOpacity>
  </View>
));

// 2. Banner Notifikasi Status
const SuccessBanner = memo(({ message }) => {
  if (!message) return null;
  return (
    <View style={styles.successBanner}>
      <Text style={styles.successIcon}>☑</Text>
      <Text style={styles.successText}>{message}</Text>
    </View>
  );
});

// 3. Card Total Pengeluaran
const TotalCard = memo(({ amount }) => (
  <View style={styles.totalCard}>
    <Text style={styles.totalLabel}>TOTAL BULAN INI</Text>
    <Text style={styles.totalAmount}>
      Rp {amount ? amount.toLocaleString('id-ID') : '0'}
    </Text>
  </View>
));

// 4. Sub-header Daftar Transaksi
const SectionHeader = memo(() => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>TRANSAKSI TERAKHIR</Text>
    <TouchableOpacity activeOpacity={0.7}>
      <Text style={styles.sortText}>Terbaru dahulu</Text>
    </TouchableOpacity>
  </View>
));

// 5. Item Baris Transaksi
const TransactionItem = memo(({ item, onPress }) => (
  <TouchableOpacity
    style={styles.card}
    onPress={() => onPress(item)}
    activeOpacity={0.75}
  >
    <View style={styles.cardLeft}>
      <Text style={styles.itemTitle}>{item.title}</Text>
      <View style={styles.badgeContainer}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.category}</Text>
        </View>
        <Text style={styles.itemDate}>{item.fullDate || item.date}</Text>
      </View>
    </View>
    <Text style={styles.itemAmount}>
      Rp {item.amount ? item.amount.toLocaleString('id-ID') : '0'}
    </Text>
  </TouchableOpacity>
));

// 6. Tombol Aksi Bawah (Ditampilkan saat ada transaksi)
const ListFooterActions = memo(({ onBukaTambah, onRefresh, showReloadButton }) => (
  <View style={styles.footerContainer}>
    <TouchableOpacity
      style={styles.addButton}
      onPress={onBukaTambah}
      activeOpacity={0.8}
    >
      <Text style={styles.addButtonText}>+ Tambah Pengeluaran</Text>
    </TouchableOpacity>

    {showReloadButton && (
      <TouchableOpacity
        style={styles.reloadButton}
        onPress={onRefresh}
        activeOpacity={0.8}
      >
        <Text style={styles.reloadButtonText}>Muat Ulang</Text>
      </TouchableOpacity>
    )}
  </View>
));

// 7. Tampilan Saat Data Kosong / Loading
const EmptyState = memo(({ loading, onRefresh }) => {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0A7365" />
      </View>
    );
  }

  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyCenterContent}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>!</Text>
        </View>
        <Text style={styles.emptyTitle}>Belum ada catatan</Text>
        <Text style={styles.emptySubtitle}>
          Mulai catat pengeluaran harian Anda agar keuangan lebih terpantau.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.retryButton}
        onPress={onRefresh}
        activeOpacity={0.8}
      >
        <Text style={styles.retryButtonText}>Coba Lagi</Text>
      </TouchableOpacity>
    </View>
  );
});

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function DaftarScreen({
  items = [],
  loading = false,
  successMessage = '',
  onRefresh,
  onBukaTambah,
  onBukaDetail,
}) {
  const totalPengeluaran = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const hasItems = items.length > 0;
  const isDeletedAction = successMessage === 'Data berhasil dihapus';

  // Render Item FlatList
  const renderItem = useCallback(
    ({ item }) => <TransactionItem item={item} onPress={onBukaDetail} />,
    [onBukaDetail]
  );

  // Key Extractor FlatList
  const keyExtractor = useCallback((item) => String(item.id), []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFBFD" />

      {/* Header Utama */}
      <Header onRefresh={onRefresh} />

      {/* Banner Notifikasi Pesan Sukses */}
      <SuccessBanner message={successMessage} />

      <FlatList
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        refreshing={loading}
        onRefresh={onRefresh}
        ListHeaderComponent={
          <>
            <TotalCard amount={totalPengeluaran} />
            {hasItems && <SectionHeader />}
          </>
        }
        ListFooterComponent={
          hasItems ? (
            <ListFooterActions
              onBukaTambah={onBukaTambah}
              onRefresh={onRefresh}
              showReloadButton={isDeletedAction}
            />
          ) : null
        }
        ListEmptyComponent={
          <EmptyState loading={loading} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Stylesheet
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFD',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E6F4F1',
    justify: 'center',
    alignItems: 'center',
  },
  refreshIcon: {
    fontSize: 18,
    color: '#0E7490',
    fontWeight: 'bold',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#DCFCE7',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 16,
  },
  successIcon: {
    fontSize: 16,
    color: '#16A34A',
    marginRight: 8,
  },
  successText: {
    fontSize: 13,
    color: '#166534',
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexGrow: 1,
  },
  totalCard: {
    backgroundColor: '#0A7365',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  totalLabel: {
    color: '#A3E635',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  totalAmount: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  sortText: {
    fontSize: 13,
    color: '#0D9488',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardLeft: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  itemDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  itemAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  footerContainer: {
    marginTop: 12,
  },
  addButton: {
    backgroundColor: '#0A7365',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  reloadButton: {
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  reloadButtonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '600',
  },

  /* Empty State UI */
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justify: 'space-between',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 10,
    minHeight: 420,
  },
  emptyCenterContent: {
    alignItems: 'center',
    justify: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    justify: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 26,
    color: '#475569',
    fontWeight: '600',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  retryButton: {
    width: '100%',
    backgroundColor: '#0A7365',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});