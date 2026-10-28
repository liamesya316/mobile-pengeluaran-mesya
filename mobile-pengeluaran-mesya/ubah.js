import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';

export default function UbahScreen({ transaction, onBatal, onSimpanPerubahan }) {
  const [title, setTitle] = useState(transaction?.title || '');
  const [amount, setAmount] = useState(transaction?.amount ? transaction.amount.toString() : '');
  const [category, setCategory] = useState(transaction?.category || 'Makanan');

  const handleSimpan = () => {
    if (!title || !amount) return;

    onSimpanPerubahan({
      ...transaction,
      title,
      amount: parseInt(amount, 10) || 0,
      category,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFBFD" />

      {/* Header Navigation */}
      <View style={styles.navHeader}>
        <TouchableOpacity style={styles.batalButton} onPress={onBatal}>
          <Text style={styles.batalText}>‹ Batal</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.pageTitle}>Ubah Transaksi</Text>

        {/* Input Judul Pengeluaran */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>JUDUL PENGELUARAN</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Masukkan judul"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* Input Nominal */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>NOMINAL (RP)</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* Dropdown / Selection Kategori */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>KATEGORI</Text>
          <TouchableOpacity style={styles.dropdown}>
            <Text style={styles.dropdownText}>{category}</Text>
            <Text style={styles.dropdownIcon}>∨</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tombol Simpan Perubahan */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSimpan}>
          <Text style={styles.submitBtnText}>Simpan Perubahan</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFD',
  },
  navHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  batalButton: {
    paddingVertical: 4,
  },
  batalText: {
    fontSize: 18,
    color: '#0A7365',
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    flex: 1,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0F172A',
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 15,
    color: '#0F172A',
  },
  dropdownIcon: {
    fontSize: 14,
    color: '#0A7365',
    fontWeight: 'bold',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  submitBtn: {
    backgroundColor: '#0A7365',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});