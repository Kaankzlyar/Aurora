import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { createAddress } from '../services/addresses';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SilverText from '@/components/SilverText';
import { Ionicons } from '@expo/vector-icons';

// Country and city data
const COUNTRIES = [
  { id: 'TR', name: 'Türkiye', cities: [
    'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin', 'Aydın', 'Balıkesir',
    'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli',
    'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari',
    'Hatay', 'Isparta', 'Mersin', 'İstanbul', 'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir',
    'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla', 'Muş', 'Nevşehir',
    'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas', 'Tekirdağ', 'Tokat',
    'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak', 'Van', 'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman',
    'Kırıkkale', 'Batman', 'Şırnak', 'Bartın', 'Ardahan', 'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye', 'Düzce'
  ]},
  { id: 'US', name: 'United States', cities: [
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'
  ]},
  { id: 'DE', name: 'Germany', cities: [
    'Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Leipzig', 'Dortmund', 'Essen'
  ]},
  { id: 'FR', name: 'France', cities: [
    'Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille'
  ]},
  { id: 'GB', name: 'United Kingdom', cities: [
    'London', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool', 'Leeds', 'Sheffield', 'Edinburgh', 'Bristol', 'Cardiff'
  ]},
  { id: 'IT', name: 'Italy', cities: [
    'Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence', 'Bari', 'Catania'
  ]},
  { id: 'ES', name: 'Spain', cities: [
    'Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao'
  ]},
  { id: 'NL', name: 'Netherlands', cities: [
    'Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Tilburg', 'Groningen', 'Almere', 'Breda', 'Nijmegen'
  ]},
  { id: 'BE', name: 'Belgium', cities: [
    'Brussels', 'Antwerp', 'Ghent', 'Charleroi', 'Liège', 'Bruges', 'Namur', 'Leuven', 'Mons', 'Aalst'
  ]},
  { id: 'CH', name: 'Switzerland', cities: [
    'Zurich', 'Geneva', 'Basel', 'Bern', 'Lausanne', 'Winterthur', 'Lucerne', 'St. Gallen', 'Lugano', 'Biel'
  ]},
  { id: 'AT', name: 'Austria', cities: [
    'Vienna', 'Graz', 'Linz', 'Salzburg', 'Innsbruck', 'Klagenfurt', 'Villach', 'Wels', 'Sankt Pölten', 'Dornbirn'
  ]},
  { id: 'PL', name: 'Poland', cities: [
    'Warsaw', 'Kraków', 'Łódź', 'Wrocław', 'Poznań', 'Gdańsk', 'Szczecin', 'Bydgoszcz', 'Lublin', 'Katowice'
  ]},
  { id: 'CZ', name: 'Czech Republic', cities: [
    'Prague', 'Brno', 'Ostrava', 'Plzen', 'Liberec', 'Olomouc', 'Ústí nad Labem', 'České Budějovice', 'Hradec Králové', 'Pardubice'
  ]},
  { id: 'HU', name: 'Hungary', cities: [
    'Budapest', 'Debrecen', 'Szeged', 'Miskolc', 'Pécs', 'Győr', 'Nyíregyháza', 'Kecskemét', 'Székesfehérvár', 'Szombathely'
  ]},
  { id: 'RO', name: 'Romania', cities: [
    'Bucharest', 'Cluj-Napoca', 'Timișoara', 'Iași', 'Constanța', 'Craiova', 'Brașov', 'Galați', 'Ploiești', 'Oradea'
  ]},
  { id: 'BG', name: 'Bulgaria', cities: [
    'Sofia', 'Plovdiv', 'Varna', 'Burgas', 'Ruse', 'Stara Zagora', 'Pleven', 'Sliven', 'Dobrich', 'Shumen'
  ]},
  { id: 'GR', name: 'Greece', cities: [
    'Athens', 'Thessaloniki', 'Patras', 'Piraeus', 'Larissa', 'Heraklion', 'Peristeri', 'Kallithea', 'Acharnes', 'Kalamaria'
  ]},
  { id: 'HR', name: 'Croatia', cities: [
    'Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar', 'Pula', 'Slavonski Brod', 'Karlovac', 'Varaždin', 'Šibenik'
  ]},
  { id: 'SI', name: 'Slovenia', cities: [
    'Ljubljana', 'Maribor', 'Celje', 'Kranj', 'Velenje', 'Koper', 'Novo Mesto', 'Ptuj', 'Trbovlje', 'Kamnik'
  ]},
  { id: 'SK', name: 'Slovakia', cities: [
    'Bratislava', 'Košice', 'Prešov', 'Žilina', 'Banská Bystrica', 'Nitra', 'Trnava', 'Trenčín', 'Martin', 'Poprad'
  ]},
  { id: 'LT', name: 'Lithuania', cities: [
    'Vilnius', 'Kaunas', 'Klaipėda', 'Šiauliai', 'Panevėžys', 'Alytus', 'Marijampolė', 'Mažeikiai', 'Jonava', 'Utena'
  ]},
  { id: 'LV', name: 'Latvia', cities: [
    'Riga', 'Daugavpils', 'Liepāja', 'Jelgava', 'Jūrmala', 'Ventspils', 'Rēzekne', 'Valmiera', 'Jēkabpils', 'Ogre'
  ]},
  { id: 'EE', name: 'Estonia', cities: [
    'Tallinn', 'Tartu', 'Narva', 'Pärnu', 'Kohtla-Järve', 'Viljandi', 'Maardu', 'Rakvere', 'Kuressaare', 'Sillamäe'
  ]},
  { id: 'FI', name: 'Finland', cities: [
    'Helsinki', 'Espoo', 'Tampere', 'Vantaa', 'Oulu', 'Turku', 'Jyväskylä', 'Lahti', 'Kuopio', 'Pori'
  ]},
  { id: 'SE', name: 'Sweden', cities: [
    'Stockholm', 'Gothenburg', 'Malmö', 'Uppsala', 'Västerås', 'Örebro', 'Linköping', 'Helsingborg', 'Jönköping', 'Norrköping'
  ]},
  { id: 'NO', name: 'Norway', cities: [
    'Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Drammen', 'Fredrikstad', 'Kristiansand', 'Tromsø', 'Sandnes', 'Bodø'
  ]},
  { id: 'DK', name: 'Denmark', cities: [
    'Copenhagen', 'Aarhus', 'Odense', 'Aalborg', 'Esbjerg', 'Randers', 'Kolding', 'Horsens', 'Vejle', 'Roskilde'
  ]},
  { id: 'IE', name: 'Ireland', cities: [
    'Dublin', 'Cork', 'Limerick', 'Galway', 'Waterford', 'Drogheda', 'Dundalk', 'Swords', 'Bray', 'Navan'
  ]},
  { id: 'PT', name: 'Portugal', cities: [
    'Lisbon', 'Porto', 'Vila Nova de Gaia', 'Amadora', 'Braga', 'Funchal', 'Coimbra', 'Setúbal', 'Almada', 'Agualva-Cacém'
  ]},
  { id: 'MT', name: 'Malta', cities: [
    'Valletta', 'Birkirkara', 'Mosta', 'Qormi', 'Żabbar', 'San Pawl il-Baħar', 'Żebbuġ', 'Sliema', 'Ħamrun', 'Naxxar'
  ]},
  { id: 'CY', name: 'Cyprus', cities: [
    'Nicosia', 'Limassol', 'Larnaca', 'Paphos', 'Famagusta', 'Kyrenia', 'Aradippou', 'Lakatamia', 'Aglandjia', 'Paralimni'
  ]}
];

export default function AddAddressScreen() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [citySearch, setCitySearch] = useState('');
  const insets = useSafeAreaInsets();
  const [formData, setFormData] = useState({
    title: '',
    country: 'Türkiye',
    city: '',
    district: '',
    neighborhood: '',
    street: '',
    buildingNo: '',
    apartmentNo: '',
    postalCode: '',
    line2: '',
    contactPhone: '',
  });

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates?.height ?? 0)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const keyboardOffSet = insets.top + 60 + 16;

  // Get available cities for selected country
  const getAvailableCities = () => {
    const selectedCountry = COUNTRIES.find(c => c.name === formData.country);
    return selectedCountry ? selectedCountry.cities : [];
  };

  // Filter countries based on search
  const getFilteredCountries = () => {
    if (!countrySearch) return COUNTRIES;
    return COUNTRIES.filter(country => 
      country.name.toLowerCase().includes(countrySearch.toLowerCase())
    );
  };

  // Filter cities based on search
  const getFilteredCities = () => {
    const cities = getAvailableCities();
    if (!citySearch) return cities;
    return cities.filter(city => 
      city.toLowerCase().includes(citySearch.toLowerCase())
    );
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCountrySelect = (countryName: string) => {
    setFormData(prev => ({ 
      ...prev, 
      country: countryName,
      city: '' // Reset city when country changes
    }));
    setShowCountryModal(false);
    setCountrySearch(''); // Clear search
  };

  const handleCitySelect = (cityName: string) => {
    setFormData(prev => ({ ...prev, city: cityName }));
    setShowCityModal(false);
    setCitySearch(''); // Clear search
  };

  const openCountryModal = () => {
    setCountrySearch(''); // Clear previous search
    setShowCountryModal(true);
  };

  const openCityModal = () => {
    if (!formData.country) return;
    setCitySearch(''); // Clear previous search
    setShowCityModal(true);
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.title || !formData.city || !formData.district || 
        !formData.neighborhood || !formData.street || !formData.buildingNo) {
      Alert.alert('Eksik Bilgi', 'Lütfen gerekli alanları doldurun.');
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        Alert.alert('Hata', 'Oturum bilgisi bulunamadı.');
        return;
      }

      await createAddress(token, formData);
      
      Alert.alert(
        'Başarılı!',
        'Adres başarıyla eklendi.',
        [
          {
            text: 'Tamam',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Adres eklenirken hata:', error);
      Alert.alert('Hata', 'Adres eklenirken hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Geri</Text>
          </Pressable>
          <SilverText style={styles.title}>Yeni Adres</SilverText>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.content}>
          <Text style={styles.errorText}>Giriş yapmanız gerekiyor.</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: 'transparent' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? keyboardOffSet : 0}
    >
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Geri</Text>
        </Pressable>
        <Text style={styles.title}>Yeni Adres</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={{ paddingBottom: (insets.bottom ?? 0) + keyboardHeight + 24, }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"

        contentInsetAdjustmentBehavior="always"
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
      >
        <Text style={styles.description}>
          Teslimat adresinizi ekleyin. Gerekli alanlar * ile işaretlenmiştir.
        </Text>

        {/* Adres Başlığı */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Adres Başlığı *</Text>
          <TextInput
            style={styles.input}
            value={formData.title}
            onChangeText={(value) => handleInputChange('title', value)}
            placeholder="Ev, İş, Ofis vb."
            placeholderTextColor="#666"
          />
        </View>

        {/* Ülke */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ülke *</Text>
          <Pressable
            style={styles.dropdownButton}
            onPress={openCountryModal}
          >
            <Text style={[styles.dropdownButtonText, !formData.country && styles.placeholderText]}>
              {formData.country || 'Ülke seçiniz'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#D4AF37" />
          </Pressable>
        </View>

        {/* Şehir */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Şehir *</Text>
          <Pressable
            style={[styles.dropdownButton, !formData.country && styles.dropdownButtonDisabled]}
            onPress={openCityModal}
            disabled={!formData.country}
          >
            <Text style={[styles.dropdownButtonText, !formData.city && styles.placeholderText]}>
              {formData.city || (formData.country ? 'Şehir seçiniz' : 'Önce ülke seçiniz')}
            </Text>
            <Ionicons name="chevron-down" size={20} color={formData.country ? "#D4AF37" : "#666"} />
          </Pressable>
        </View>

        {/* İlçe */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>İlçe *</Text>
          <TextInput
            style={styles.input}
            value={formData.district}
            onChangeText={(value) => handleInputChange('district', value)}
            placeholder="Pamukkale"
            placeholderTextColor="#666"
          />
        </View>

        {/* Mahalle */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mahalle *</Text>
          <TextInput
            style={styles.input}
            value={formData.neighborhood}
            onChangeText={(value) => handleInputChange('neighborhood', value)}
            placeholder="Fenerbahçe"
            placeholderTextColor="#666"
          />
        </View>

        {/* Sokak */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Sokak/Cadde *</Text>
          <TextInput
            style={styles.input}
            value={formData.street}
            onChangeText={(value) => handleInputChange('street', value)}
            placeholder="Atatürk Caddesi"
            placeholderTextColor="#666"
          />
        </View>

        {/* Bina No */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bina No *</Text>
          <TextInput
            style={styles.input}
            value={formData.buildingNo}
            onChangeText={(value) => handleInputChange('buildingNo', value)}
            placeholder="15"
            placeholderTextColor="#666"
          />
        </View>

        {/* Daire No */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Daire No</Text>
          <TextInput
            style={styles.input}
            value={formData.apartmentNo}
            onChangeText={(value) => handleInputChange('apartmentNo', value)}
            placeholder="5"
            placeholderTextColor="#666"
          />
        </View>

        {/* Posta Kodu */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Posta Kodu</Text>
          <TextInput
            style={styles.input}
            value={formData.postalCode}
            onChangeText={(value) => handleInputChange('postalCode', value)}
            placeholder="34726"
            placeholderTextColor="#666"
            keyboardType="numeric"
          />
        </View>

        {/* Ek Bilgi */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Apartman Adı / Blok</Text>
          <TextInput
            style={styles.input}
            value={formData.line2}
            onChangeText={(value) => handleInputChange('line2', value)}
            placeholder="Site adı, blok bilgisi vb."
            placeholderTextColor="#666"
          />
        </View>

        {/* İletişim Telefonu */}
        {/* <View style={styles.inputGroup}>
          <Text style={styles.label}>İletişim Telefonu</Text>
          <TextInput
            style={styles.input}
            value={formData.contactPhone}
            onChangeText={(value) => handleInputChange('contactPhone', value)}
            placeholder="+90 555 123 45 67"
            placeholderTextColor="#666"
            keyboardType="phone-pad"
          />
        </View> */}

        {/* Kaydet Butonu */}
        <View style={styles.submitSection}>
          <Pressable
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#0B0B0B" />
            ) : (
              <Text style={styles.submitButtonText}>💾 Adresi Kaydet</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
      

       {/* Ülke Seçim Modal */}
      <Modal
        visible={showCountryModal}
        onRequestClose={() => setShowCountryModal(false)}
        transparent={true}
        animationType="fade"
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowCountryModal(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ülke Seçin</Text>
              <Pressable
                style={styles.closeButton}
                onPress={() => setShowCountryModal(false)}
              >
                <Ionicons name="close" size={24} color="#D4AF37" />
              </Pressable>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Ülke ara..."
              placeholderTextColor="#666"
              value={countrySearch}
              onChangeText={setCountrySearch}
            />
            <FlatList
              data={getFilteredCountries()}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.modalItem, formData.country === item.name && styles.modalItemSelected]}
                  onPress={() => handleCountrySelect(item.name)}
                >
                  <Text style={[styles.modalItemText, formData.country === item.name && styles.modalItemTextSelected]}>
                    {item.name}
                  </Text>
                  {formData.country === item.name && (
                    <Ionicons name="checkmark" size={20} color="#D4AF37" />
                  )}
                </Pressable>
              )}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* Şehir Seçim Modal */}
      <Modal
        visible={showCityModal}
        onRequestClose={() => setShowCityModal(false)}
        transparent={true}
        animationType="fade"
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowCityModal(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{formData.country} Şehirleri</Text>
              <Pressable
                style={styles.closeButton}
                onPress={() => setShowCityModal(false)}
              >
                <Ionicons name="close" size={24} color="#D4AF37" />
              </Pressable>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Şehir ara..."
              placeholderTextColor="#666"
              value={citySearch}
              onChangeText={setCitySearch}
            />
            <FlatList
              data={getFilteredCities()}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.modalItem, formData.city === item && styles.modalItemSelected]}
                  onPress={() => handleCitySelect(item)}
                >
                  <Text style={[styles.modalItemText, formData.city === item && styles.modalItemTextSelected]}>
                    {item}
                  </Text>
                  {formData.city === item && (
                    <Ionicons name="checkmark" size={20} color="#D4AF37" />
                  )}
                </Pressable>
              )}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#D4AF37',
    fontSize: 16,
    fontFamily: 'Montserrat_500Medium',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
    padding: 16,
    paddingBottom: 0,
  },
  description: {
    color: '#CCCCCC',
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat_500Medium',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
    borderWidth: 1,
    borderColor: '#333',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  dropdownButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
  },
  placeholderText: {
    color: '#666',
  },
  dropdownButtonDisabled: {
    backgroundColor: '#333',
    borderColor: '#333',
  },
  submitSection: {
    marginTop: 24,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#666',
  },
  submitButtonText: {
    color: '#0B0B0B',
    fontSize: 18,
    fontFamily: 'Montserrat_600SemiBold',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 18,
    fontFamily: 'Montserrat_500Medium',
    textAlign: 'center',
    marginTop: 100,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'Montserrat_600SemiBold',
  },
  closeButton: {
    padding: 5,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalItemSelected: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
  },
  modalItemText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Montserrat_400Regular',
  },
  modalItemTextSelected: {
    color: '#D4AF37',
    fontFamily: 'Montserrat_600SemiBold',
  },
  searchInput: {
    width: '100%',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
  },
});
