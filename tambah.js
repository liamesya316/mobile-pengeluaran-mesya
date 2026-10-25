import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

const KATEGORI_LIST = ['Tanpa Kategori', 'Makanan', 'Transportasi'];

export default function TambahScreen({ onBatal, onSimpan, categories = KATEGORI_LIST }) {
  const [step, setStep] = useState(1);

  const [judul, setJudul] = useState('');
  const [nominal, setNominal] = useState('');
  const [selectedKategori, setSelectedKategori] = useState(
    () => categories.find((category) => category !== 'Tanpa Kategori') || 'Makanan'
  );

  // State loading untuk proses "Menyimpan..."
  const [isSaving, setIsSaving] = useState(false);

  // State untuk menyimpan pesan error validasi
  const [errors, setErrors] = useState({
    judul: '',
    nominal: '',
    kategori: '',
  });

  // Fungsi Validasi Form Input
  const validateForm = () => {
    let isValid = true;
    const newErrors = { judul: '', nominal: '', kategori: '' };

    if (!judul.trim()) {
      newErrors.judul = 'Judul wajib diisi';
      isValid = false;
    }

    const numericNominal = Number(nominal);
    if (!nominal.trim()) {
      newErrors.nominal = 'Nominal wajib diisi';
      isValid = false;
    } else if (isNaN(numericNominal) || numericNominal <= 0) {
      newErrors.nominal = 'Nominal harus angka positif';
      isValid = false;
    }

    if (!selectedKategori) {
      newErrors.kategori = 'Kategori wajib dipilih';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSelesaiPilihKategori = () => {
    if (selectedKategori) {
      setErrors((prev) => ({ ...prev, kategori: '' }));
    }
    setStep(1);
  };

  const handleSimpanFinal = async () => {
    if (validateForm()) {
      setIsSaving(true);
      try {
        await onSimpan({
          title: judul.trim(),
          amount: Number(nominal),
          category: selectedKategori,
        });
      } finally {
        setIsSaving(false);
      }
    }
  };

  // ==========================================
  // TAMPILAN STEP 2: PILIH KATEGORI (03-Pilih_kategori)
  // ==========================================
  if (step === 2) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAFBFD" />

        <View style={styles.navHeader}>
          <TouchableOpacity
            style={styles.batalButton}
            onPress={() => setStep(1)}
          >
            <Text style={styles.batalText}>‹ Kembali</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.screenTitle}>Kategori Pengeluaran</Text>

          {categories.map((kat) => {
            const isSelected = selectedKategori === kat;

            return (
              <TouchableOpacity
                key={kat}
                activeOpacity={0.8}
                style={[
                  styles.categoryCard,
                  isSelected && styles.categoryCardSelected,
                ]}
                onPress={() => setSelectedKategori(kat)}
              >
                <Text
                  style={[
                    styles.categoryItemText,
                    isSelected && styles.categoryItemTextSelected,
                  ]}
                >
                  {kat}
                </Text>

                <View
                  style={[
                    styles.radioCircle,
                    isSelected && styles.radioCircleSelected,
                  ]}
                >
                  {isSelected && <Text style={styles.checkMark}>✓</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.mainButton}
            onPress={handleSelesaiPilihKategori}
          >
            <Text style={styles.mainButtonText}>Pilih</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================
  // TAMPILAN STEP 1: FORM INPUT & MENYIMPAN (06-menyimpan)
  // ==========================================
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFBFD" />

      {/* Header Header Batal / Judul */}
      <View style={styles.navHeader}>
        <TouchableOpacity
          style={styles.batalButton}
          onPress={onBatal}
          disabled={isSaving} // Matikan navigasi saat proses menyimpan
        >
          <Text style={[styles.batalText, isSaving && styles.textDisabled]}>
            ‹ Batal
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.screenTitle}>
          {isSaving ? 'Tambah' : 'Pengeluaran Baru'}
        </Text>

        {/* Input Judul */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, !!errors.judul && styles.labelError]}>
            JUDUL PENGELUARAN
          </Text>
          <TextInput
            style={[
              styles.input,
              !!errors.judul && styles.inputError,
              isSaving && styles.inputDisabled,
            ]}
            placeholder="cth. Makan siang"
            placeholderTextColor="#94A3B8"
            editable={!isSaving}
            value={judul}
            onChangeText={(text) => {
              setJudul(text);
              if (errors.judul) setErrors((prev) => ({ ...prev, judul: '' }));
            }}
          />
          {!!errors.judul && (
            <Text style={styles.errorText}>ⓘ {errors.judul}</Text>
          )}
        </View>

        {/* Input Nominal */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, !!errors.nominal && styles.labelError]}>
            NOMINAL (RP)
          </Text>
          <TextInput
            style={[
              styles.input,
              !!errors.nominal && styles.inputError,
              isSaving && styles.inputDisabled,
            ]}
            placeholder="0"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            editable={!isSaving}
            value={nominal}
            onChangeText={(text) => {
              setNominal(text);
              if (errors.nominal) setErrors((prev) => ({ ...prev, nominal: '' }));
            }}
          />
          {!!errors.nominal && (
            <Text style={styles.errorText}>ⓘ {errors.nominal}</Text>
          )}
        </View>

        {/* Dropdown Kategori */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, !!errors.kategori && styles.labelError]}>
            KATEGORI
          </Text>
          <TouchableOpacity
            style={[
              styles.dropdown,
              !!errors.kategori && styles.inputError,
              isSaving && styles.inputDisabled,
            ]}
            disabled={isSaving}
            onPress={() => setStep(2)}
          >
            <Text
              style={[
                styles.dropdownText,
                !selectedKategori && styles.dropdownPlaceholder,
              ]}
            >
              {selectedKategori || 'Pilih kategori...'}
            </Text>
            <Text style={styles.dropdownIcon}>∨</Text>
          </TouchableOpacity>
          {!!errors.kategori && (
            <Text style={styles.errorText}>ⓘ {errors.kategori}</Text>
          )}
        </View>
      </ScrollView>

      {/* Tombol Simpan / Menyimpan... */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.mainButton, isSaving && styles.buttonDisabled]}
          onPress={handleSimpanFinal}
          disabled={isSaving}
        >
          {isSaving ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#94A3B8" style={styles.spinner} />
              <Text style={styles.savingButtonText}>Menyimpan...</Text>
            </View>
          ) : (
            <Text style={styles.mainButtonText}>Simpan</Text>
          )}
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
  textDisabled: {
    color: '#94A3B8',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    flex: 1,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  labelError: {
    color: '#DC2626',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0F172A',
  },
  inputDisabled: {
    backgroundColor: '#F8FAFC',
    color: '#64748B',
  },
  inputError: {
    borderColor: '#DC2626',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 15,
    color: '#0F172A',
  },
  dropdownPlaceholder: {
    color: '#94A3B8',
  },
  dropdownIcon: {
    fontSize: 14,
    color: '#64748B',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  mainButton: {
    backgroundColor: '#0A7365',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#E2E8F0', // Warna abu-abu saat proses simpan
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    marginRight: 8,
  },
  savingButtonText: {
    color: '#64748B', // Warna teks abu-abu sesuai UI 06-menyimpan
    fontSize: 16,
    fontWeight: '500',
  },

  /* Style Pilih Kategori */
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryCardSelected: {
    borderColor: '#0A7365',
    backgroundColor: '#E6F4F1',
  },
  categoryItemText: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
  },
  categoryItemTextSelected: {
    color: '#0A7365',
    fontWeight: '600',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: '#0A7365',
    backgroundColor: '#0A7365',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});