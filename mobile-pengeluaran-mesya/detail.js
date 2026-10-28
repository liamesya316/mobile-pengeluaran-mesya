import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
} from 'react-native';

// --- SUB-KOMPONEN PRESENTASIONAL ---

// 1. Header Navigasi Kembali
const DetailHeader = ({ onKembali }) => (
  <TouchableOpacity style={styles.backBtn} onPress={onKembali}>
    <Text style={styles.backText}>‹ Kembali</Text>
  </TouchableOpacity>
);

// 2. Card Informasi Rincian Transaksi
const TransactionDetailCard = ({ transaction }) => {
  const formattedAmount = `Rp ${transaction.amount.toLocaleString('id-ID')}`;
  const displayDate = transaction.fullDate || transaction.time;

  return (
    <View style={styles.detailCard}>
      <View style={styles.rowItem}>
        <Text style={styles.label}>Nominal</Text>
        <Text style={styles.valueAmount}>{formattedAmount}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.rowItem}>
        <Text style={styles.label}>Kategori</Text>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{transaction.category}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.rowItem}>
        <Text style={styles.label}>Tanggal</Text>
        <Text style={styles.value}>{displayDate}</Text>
      </View>
    </View>
  );
};

// 3. Tombol Aksi Bawah (Ubah & Hapus)
const ActionButtons = ({ onUbah, onDeleteClick }) => (
  <View style={styles.actionContainer}>
    <TouchableOpacity style={styles.editBtn} onPress={onUbah}>
      <Text style={styles.editBtnText}>✏ Ubah Transaksi</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.deleteBtn} onPress={onDeleteClick}>
      <Text style={styles.deleteBtnText}>🗑 Hapus Pengeluaran</Text>
    </TouchableOpacity>
  </View>
);

// 4. Modal Dialog Konfirmasi Hapus (Desain 11-konfirmasi_hapus)
const DeleteConfirmationModal = ({
  visible,
  transaction,
  onCancel,
  onConfirm,
}) => {
  if (!transaction) return null;

  const formattedAmount = `Rp ${transaction.amount.toLocaleString('id-ID')}`;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Konfirmasi Hapus</Text>
          <Text style={styles.modalDescription}>
            Apakah Anda yakin ingin menghapus data{' '}
            <Text style={styles.boldText}>{transaction.title}</Text> sejumlah{' '}
            <Text style={styles.boldText}>{formattedAmount}</Text>? Tindakan ini
            tidak dapat dibatalkan.
          </Text>

          <View style={styles.modalButtonContainer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelBtnText}>Batal</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.confirmDeleteBtn} onPress={onConfirm}>
              <Text style={styles.confirmDeleteBtnText}>Hapus</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// --- KOMPONEN UTAMA ---

export default function DetailScreen({ transaction, onKembali, onHapus, onUbah }) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (!transaction) return null;

  const handleConfirmDelete = () => {
    setShowConfirmModal(false);
    onHapus(transaction.id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFBFD" />

      <DetailHeader onKembali={onKembali} />

      <View style={styles.content}>
        <Text style={styles.sectionHeaderLabel}>DETAIL TRANSAKSI</Text>
        <Text style={styles.transTitle}>{transaction.title}</Text>

        <TransactionDetailCard transaction={transaction} />
      </View>

      <ActionButtons
        onUbah={onUbah}
        onDeleteClick={() => setShowConfirmModal(true)}
      />

      <DeleteConfirmationModal
        visible={showConfirmModal}
        transaction={transaction}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmDelete}
      />
    </SafeAreaView>
  );
}

// --- STYLESHEET ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFD',
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backText: {
    fontSize: 16,
    color: '#0A7365',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  sectionHeaderLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  transTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 20,
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  label: {
    fontSize: 14,
    color: '#64748B',
  },
  value: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
  },
  valueAmount: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: 'bold',
  },
  tag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  editBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#0A7365',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  editBtnText: {
    color: '#0A7365',
    fontSize: 15,
    fontWeight: '600',
  },
  deleteBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  // STYLES MODAL KONFIRMASI HAPUS
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 20,
  },
  boldText: {
    fontWeight: '600',
    color: '#0F172A',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelBtnText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmDeleteBtn: {
    flex: 1,
    backgroundColor: '#DC2626',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  confirmDeleteBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});