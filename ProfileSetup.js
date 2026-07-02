import React, { useState, useRef, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ScrollView,
    Modal,
    FlatList,
    ActivityIndicator,
    StatusBar,
    Animated,
    Dimensions
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import API_BASE_URL from './config/api';

const { width } = Dimensions.get('window');

// Premium Dark Theme Palette
const T = {
  primary: '#9E0A0A', 
  secondary: '#C62828', 
  accent: '#FFE500', 
  white: '#FFFFFF',
  dark: '#0A0000', 
  bgGradient: ['#1A0202', '#4A0404', '#9E0A0A'], 
  glassBg: 'rgba(255, 255, 255, 0.06)',
  glassBorder: 'rgba(255, 255, 255, 0.15)',
  glassInput: 'rgba(0, 0, 0, 0.25)',
  textLight: 'rgba(255, 255, 255, 0.85)',
  textMuted: 'rgba(255, 255, 255, 0.5)',
};

export default function ProfileSetup({ navigation }) {
    const route = useRoute();
    const user = route.params?.user;
    const userEmail = user?.email || 'guest@motionphysio.com';
    const insets = useSafeAreaInsets();

    const [firstName, setFirstName] = useState('');
    const [surname, setSurname] = useState('');
    const [sex, setSex] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [loading, setLoading] = useState(false);

    // Heart Surgery States
    const [heartSurgery, setHeartSurgery] = useState(null);
    const [heartSurgeryComment, setHeartSurgeryComment] = useState('');
    const [withinSixMonths, setWithinSixMonths] = useState(null);

    // Fractures States
    const [fractures, setFractures] = useState(null);
    const [fracturesComment, setFracturesComment] = useState('');
    const [withinSixMonthsFracture, setWithinSixMonthsFracture] = useState(null);

    const [showSexModal, setShowSexModal] = useState(false);

    // Date Picker states
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateObject, setDateObject] = useState(new Date());

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const sexOptions = ['Male', 'Female', 'Other'];

    const calculateBMI = () => {
        try {
            if (height && weight) {
                const heightInMeters = parseFloat(height) / 100;
                const weightInKg = parseFloat(weight);
                if (heightInMeters > 0 && weightInKg > 0) {
                    const bmi = (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
                    return String(bmi || '--');
                }
            }
        } catch (error) {}
        return '--';
    };

    const getBMICategory = (bmiStr) => {
        if (bmiStr === '--') return { label: 'Enter metrics', color: T.textMuted };
        const bmi = parseFloat(bmiStr);
        if (bmi < 18.5) return { label: 'Underweight', color: '#64B5F6' };
        if (bmi < 25) return { label: 'Healthy Weight', color: '#81C784' };
        if (bmi < 30) return { label: 'Overweight', color: '#FFB74D' };
        return { label: 'Obese', color: '#E57373' };
    };

    const currentBMI = calculateBMI();
    const bmiInfo = getBMICategory(currentBMI);

    const showDatepicker = () => setShowDatePicker(true);

    const onDateChange = (event, selectedDate) => {
        if (Platform.OS === 'android') setShowDatePicker(false);
        if (event.type === 'set' && selectedDate) {
            setDateObject(selectedDate);
            const day = String(selectedDate.getDate()).padStart(2, '0');
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const year = selectedDate.getFullYear();
            setBirthDate(`${day}-${month}-${year}`);
        }
    };

    const handleSubmit = async () => {
        if (!firstName || !surname || !sex || !birthDate || !height || !weight) {
            Alert.alert('Missing Info', 'Please fill in all required personal and metric fields to continue.');
            return;
        }

        if (heartSurgery === true && withinSixMonths === null) {
            Alert.alert('Missing Info', 'Please answer the follow-up question about heart surgery.');
            return;
        }

        if (fractures === true && withinSixMonthsFracture === null) {
            Alert.alert('Missing Info', 'Please answer the follow-up question about fractures.');
            return;
        }

        if (heartSurgery === null || fractures === null) {
            Alert.alert('Missing Info', 'Please answer all medical history questions.');
            return;
        }

        setLoading(true);

        try {
            const profileData = {
                email: userEmail.trim().toLowerCase(),
                firstName: firstName.trim(),
                surname: surname.trim(),
                sex: sex,
                birthDate: dateObject.toISOString(),
                height: parseFloat(height) || 0,
                weight: parseFloat(weight) || 0,
                heartSurgery: heartSurgery,
                withinSixMonths: withinSixMonths,
                heartSurgeryComment: heartSurgeryComment.trim() || '',
                fractures: fractures,
                withinSixMonthsFracture: withinSixMonthsFracture,
                fracturesComment: fracturesComment.trim() || '',
            };

            try {
                const response = await fetch(`${API_BASE_URL}/users/profile`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(profileData),
                });
                if (!response.ok) console.warn('Profile update status:', response.status);
            } catch (backendError) {
                console.warn('Offline mode proceeding:', backendError.message);
            }

            navigation.navigate('HomeScreen', {
                userName: firstName,
                userEmail: userEmail,
            });

        } catch (error) {
            Alert.alert('Error', 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient colors={T.bgGradient} style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Feather name="chevron-left" size={24} color={T.white} />
                </TouchableOpacity>
                <View style={styles.headerTitleWrap}>
                    <Text style={styles.headerTitle}>Clinical Intake</Text>
                    <Text style={styles.headerSub}>Personalize your therapy</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <Animated.ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                >
                    {/* Notice Card */}
                    <View style={styles.noticeCard}>
                        <View style={styles.noticeIconWrap}>
                            <Ionicons name="shield-checkmark" size={20} color={T.dark} />
                        </View>
                        <View style={styles.noticeTextWrap}>
                            <Text style={styles.noticeTitle}>Secure & Confidential</Text>
                            <Text style={styles.noticeDesc}>
                                Your clinical metrics help generate precise, high-accuracy movement guides safely.
                            </Text>
                        </View>
                    </View>

                    {/* Section 1: Identity */}
                    <Text style={styles.sectionTitle}>Identity</Text>
                    <View style={styles.glassCard}>
                        <View style={styles.row}>
                            <View style={styles.inputGroupHalf}>
                                <Text style={styles.label}>FIRST NAME</Text>
                                <View style={styles.inputWrapper}>
                                    <Feather name="user" size={16} color={T.textMuted} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="John"
                                        placeholderTextColor={T.textMuted}
                                        value={firstName}
                                        onChangeText={setFirstName}
                                    />
                                </View>
                            </View>
                            <View style={styles.inputGroupHalf}>
                                <Text style={styles.label}>SURNAME</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={[styles.input, { paddingLeft: 16 }]}
                                        placeholder="Doe"
                                        placeholderTextColor={T.textMuted}
                                        value={surname}
                                        onChangeText={setSurname}
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={styles.inputGroupHalf}>
                                <Text style={styles.label}>BIOLOGICAL SEX</Text>
                                <TouchableOpacity style={styles.dropdown} onPress={() => setShowSexModal(true)}>
                                    <Text style={[styles.dropdownText, !sex && { color: T.textMuted }]}>
                                        {sex || 'Select'}
                                    </Text>
                                    <Feather name="chevron-down" size={16} color={T.textMuted} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.inputGroupHalf}>
                                <Text style={styles.label}>BIRTHDATE</Text>
                                <TouchableOpacity style={styles.dropdown} onPress={showDatepicker}>
                                    <Text style={[styles.dropdownText, !birthDate && { color: T.textMuted }]}>
                                        {birthDate || 'DD-MM-YYYY'}
                                    </Text>
                                    <Feather name="calendar" size={16} color={T.accent} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Section 2: Physical Metrics */}
                    <Text style={styles.sectionTitle}>Physical Metrics</Text>
                    <View style={styles.glassCard}>
                        <View style={styles.metricsRow}>
                            <View style={styles.metricItem}>
                                <Text style={styles.label}>HEIGHT (CM)</Text>
                                <View style={styles.metricInputWrap}>
                                    <TextInput
                                        style={styles.metricInput}
                                        placeholder="175"
                                        placeholderTextColor={T.textMuted}
                                        value={height}
                                        onChangeText={setHeight}
                                        keyboardType="numeric"
                                        maxLength={3}
                                    />
                                </View>
                            </View>

                            <View style={styles.metricItem}>
                                <Text style={styles.label}>WEIGHT (KG)</Text>
                                <View style={styles.metricInputWrap}>
                                    <TextInput
                                        style={styles.metricInput}
                                        placeholder="70"
                                        placeholderTextColor={T.textMuted}
                                        value={weight}
                                        onChangeText={setWeight}
                                        keyboardType="numeric"
                                        maxLength={3}
                                    />
                                </View>
                            </View>

                            <View style={styles.bmiBox}>
                                <Text style={styles.label}>BMI SCORE</Text>
                                <Text style={styles.bmiValue}>{currentBMI}</Text>
                                <Text style={[styles.bmiStatus, { color: bmiInfo.color }]}>
                                    {bmiInfo.label}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Section 3: Medical History */}
                    <Text style={styles.sectionTitle}>Medical History</Text>
                    <View style={styles.glassCard}>
                        
                        {/* Heart Surgery */}
                        <View style={styles.questionBlock}>
                            <View style={styles.questionHeader}>
                                <View style={styles.qIcon}><MaterialCommunityIcons name="heart-pulse" size={18} color={T.accent} /></View>
                                <Text style={styles.questionText}>Have you ever had heart surgery?</Text>
                            </View>
                            <View style={styles.toggleRow}>
                                <TouchableOpacity 
                                    style={[styles.toggleBtn, heartSurgery === true && styles.toggleBtnActive]}
                                    onPress={() => { setHeartSurgery(true); setHeartSurgeryComment(''); }}
                                >
                                    <Text style={[styles.toggleBtnTxt, heartSurgery === true && styles.toggleBtnTxtActive]}>Yes</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.toggleBtn, heartSurgery === false && styles.toggleBtnActive]}
                                    onPress={() => { setHeartSurgery(false); setWithinSixMonths(null); setHeartSurgeryComment(''); }}
                                >
                                    <Text style={[styles.toggleBtnTxt, heartSurgery === false && styles.toggleBtnTxtActive]}>No</Text>
                                </TouchableOpacity>
                            </View>

                            {heartSurgery === true && (
                                <View style={styles.nestedBlock}>
                                    <Text style={styles.nestedQText}>Within the last 6 months?</Text>
                                    <View style={styles.toggleRow}>
                                        <TouchableOpacity 
                                            style={[styles.nestedToggleBtn, withinSixMonths === true && styles.nestedToggleBtnActive]}
                                            onPress={() => setWithinSixMonths(true)}
                                        >
                                            <Text style={[styles.nestedToggleTxt, withinSixMonths === true && styles.nestedToggleTxtActive]}>Yes</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            style={[styles.nestedToggleBtn, withinSixMonths === false && styles.nestedToggleBtnActive]}
                                            onPress={() => setWithinSixMonths(false)}
                                        >
                                            <Text style={[styles.nestedToggleTxt, withinSixMonths === false && styles.nestedToggleTxtActive]}>No</Text>
                                        </TouchableOpacity>
                                    </View>
                                    {withinSixMonths !== null && (
                                        <TextInput
                                            style={styles.textArea}
                                            placeholder="Describe procedure details & precautions..."
                                            placeholderTextColor={T.textMuted}
                                            value={heartSurgeryComment}
                                            onChangeText={setHeartSurgeryComment}
                                            multiline
                                            numberOfLines={3}
                                        />
                                    )}
                                </View>
                            )}
                        </View>

                        <View style={styles.divider} />

                        {/* Fractures */}
                        <View style={styles.questionBlock}>
                            <View style={styles.questionHeader}>
                                <View style={styles.qIcon}><MaterialCommunityIcons name="bone" size={18} color={T.accent} /></View>
                                <Text style={styles.questionText}>Any recent bone fractures?</Text>
                            </View>
                            <View style={styles.toggleRow}>
                                <TouchableOpacity 
                                    style={[styles.toggleBtn, fractures === true && styles.toggleBtnActive]}
                                    onPress={() => { setFractures(true); setFracturesComment(''); }}
                                >
                                    <Text style={[styles.toggleBtnTxt, fractures === true && styles.toggleBtnTxtActive]}>Yes</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.toggleBtn, fractures === false && styles.toggleBtnActive]}
                                    onPress={() => { setFractures(false); setWithinSixMonthsFracture(null); setFracturesComment(''); }}
                                >
                                    <Text style={[styles.toggleBtnTxt, fractures === false && styles.toggleBtnTxtActive]}>No</Text>
                                </TouchableOpacity>
                            </View>

                            {fractures === true && (
                                <View style={styles.nestedBlock}>
                                    <Text style={styles.nestedQText}>Still recovering or within 6 months?</Text>
                                    <View style={styles.toggleRow}>
                                        <TouchableOpacity 
                                            style={[styles.nestedToggleBtn, withinSixMonthsFracture === true && styles.nestedToggleBtnActive]}
                                            onPress={() => setWithinSixMonthsFracture(true)}
                                        >
                                            <Text style={[styles.nestedToggleTxt, withinSixMonthsFracture === true && styles.nestedToggleTxtActive]}>Yes</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            style={[styles.nestedToggleBtn, withinSixMonthsFracture === false && styles.nestedToggleBtnActive]}
                                            onPress={() => setWithinSixMonthsFracture(false)}
                                        >
                                            <Text style={[styles.nestedToggleTxt, withinSixMonthsFracture === false && styles.nestedToggleTxtActive]}>No</Text>
                                        </TouchableOpacity>
                                    </View>
                                    {withinSixMonthsFracture !== null && (
                                        <TextInput
                                            style={styles.textArea}
                                            placeholder="Describe details of the fracture(s)..."
                                            placeholderTextColor={T.textMuted}
                                            value={fracturesComment}
                                            onChangeText={setFracturesComment}
                                            multiline
                                            numberOfLines={3}
                                        />
                                    )}
                                </View>
                            )}

                            {fractures === false && (
                                <TextInput
                                    style={[styles.textArea, { marginTop: 12 }]}
                                    placeholder="Additional joint/bone comments (optional)"
                                    placeholderTextColor={T.textMuted}
                                    value={fracturesComment}
                                    onChangeText={setFracturesComment}
                                    multiline
                                    numberOfLines={2}
                                />
                            )}
                        </View>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity 
                        style={[styles.submitBtn, loading && { opacity: 0.7 }]} 
                        onPress={handleSubmit}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#FFE500', '#FFB300']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={styles.submitGradient}
                        >
                            {loading ? (
                                <ActivityIndicator color={T.dark} size="small" />
                            ) : (
                                <>
                                    <Text style={styles.submitBtnTxt}>Complete Intake</Text>
                                    <Feather name="arrow-right" size={20} color={T.dark} />
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </Animated.ScrollView>
            </KeyboardAvoidingView>

            {/* Date Picker */}
            {showDatePicker && (
                <DateTimePicker
                    value={dateObject}
                    mode={'date'}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onDateChange}
                    maximumDate={new Date()}
                />
            )}

            {/* Sex Modal */}
            <Modal visible={showSexModal} transparent animationType="fade" onRequestClose={() => setShowSexModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Biological Sex</Text>
                        {sexOptions.map((item) => (
                            <TouchableOpacity 
                                key={item} 
                                style={[styles.modalOption, sex === item && styles.modalOptionActive]}
                                onPress={() => { setSex(item); setShowSexModal(false); }}
                            >
                                <Text style={[styles.modalOptionTxt, sex === item && styles.modalOptionTxtActive]}>{item}</Text>
                                {sex === item && <Feather name="check" size={18} color={T.accent} />}
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowSexModal(false)}>
                            <Text style={styles.modalCloseTxt}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    backBtn: {
        width: 40, height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)'
    },
    headerTitleWrap: { alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '900', color: T.white, letterSpacing: 0.5 },
    headerSub: { fontSize: 12, color: T.textLight, marginTop: 2 },
    
    scrollContent: { paddingHorizontal: 20, paddingTop: 10 },

    noticeCard: {
        flexDirection: 'row',
        backgroundColor: T.accent,
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        alignItems: 'center',
        shadowColor: '#FFE500',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    noticeIconWrap: {
        width: 36, height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.1)',
        alignItems: 'center', justifyContent: 'center',
        marginRight: 12,
    },
    noticeTextWrap: { flex: 1 },
    noticeTitle: { fontSize: 14, fontWeight: '900', color: T.dark, marginBottom: 2 },
    noticeDesc: { fontSize: 11, color: T.dark, fontWeight: '600', opacity: 0.8 },

    sectionTitle: { fontSize: 14, fontWeight: '800', color: T.white, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginLeft: 4 },
    
    glassCard: {
        backgroundColor: T.glassBg,
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: T.glassBorder,
        marginBottom: 24,
    },

    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    inputGroupHalf: { flex: 1, marginHorizontal: 4 },
    label: { fontSize: 10, fontWeight: '800', color: T.accent, letterSpacing: 0.8, marginBottom: 8 },
    
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: T.glassInput,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 14,
        height: 50,
    },
    inputIcon: { marginLeft: 16, marginRight: 8 },
    input: {
        flex: 1,
        height: '100%',
        color: T.white,
        fontSize: 15,
        fontWeight: '600',
        paddingRight: 16,
    },
    dropdown: {
        height: 50,
        backgroundColor: T.glassInput,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 14,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownText: { fontSize: 15, color: T.white, fontWeight: '600' },

    metricsRow: { flexDirection: 'row', justifyContent: 'space-between' },
    metricItem: { flex: 1, marginRight: 12 },
    metricInputWrap: {
        backgroundColor: T.glassInput,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 14, height: 60,
        alignItems: 'center', justifyContent: 'center'
    },
    metricInput: {
        fontSize: 22, fontWeight: '900', color: T.white, textAlign: 'center', width: '100%'
    },
    bmiBox: {
        flex: 1.2,
        backgroundColor: 'rgba(255,229,0,0.1)',
        borderWidth: 1, borderColor: 'rgba(255,229,0,0.3)',
        borderRadius: 14,
        alignItems: 'center', justifyContent: 'center',
        paddingVertical: 10,
    },
    bmiValue: { fontSize: 26, fontWeight: '900', color: T.accent, marginVertical: 2 },
    bmiStatus: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },

    questionBlock: { marginVertical: 4 },
    questionHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
    qIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
    questionText: { flex: 1, fontSize: 15, fontWeight: '700', color: T.white, lineHeight: 22, paddingTop: 2 },
    
    toggleRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
    toggleBtn: {
        flex: 1, height: 46,
        borderRadius: 12,
        backgroundColor: T.glassInput,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center', justifyContent: 'center'
    },
    toggleBtnActive: { backgroundColor: T.accent, borderColor: T.accent },
    toggleBtnTxt: { fontSize: 14, fontWeight: '700', color: T.textLight },
    toggleBtnTxtActive: { color: T.dark, fontWeight: '900' },

    nestedBlock: {
        backgroundColor: 'rgba(0,0,0,0.15)',
        borderRadius: 16, padding: 16, marginTop: 12,
        borderLeftWidth: 3, borderLeftColor: T.accent,
    },
    nestedQText: { fontSize: 13, fontWeight: '600', color: T.textLight, marginBottom: 10 },
    nestedToggleBtn: {
        flex: 1, height: 40, borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center', justifyContent: 'center'
    },
    nestedToggleBtnActive: { backgroundColor: 'rgba(255,255,255,0.2)', borderColor: T.white },
    nestedToggleTxt: { fontSize: 13, fontWeight: '600', color: T.textMuted },
    nestedToggleTxtActive: { color: T.white, fontWeight: '800' },

    textArea: {
        backgroundColor: T.glassInput,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 14,
        padding: 16, color: T.white,
        fontSize: 14, fontWeight: '500',
        minHeight: 80, textAlignVertical: 'top',
        marginTop: 12,
    },

    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 20 },

    submitBtn: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: T.accent,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    submitGradient: {
        flexDirection: 'row',
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    submitBtnTxt: { fontSize: 16, fontWeight: '900', color: T.dark, letterSpacing: 0.5 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#1A0202', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 40, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    modalTitle: { fontSize: 18, fontWeight: '900', color: T.white, marginBottom: 20, textAlign: 'center' },
    modalOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    modalOptionActive: { backgroundColor: 'rgba(255,229,0,0.05)', borderRadius: 12, paddingHorizontal: 16, borderBottomWidth: 0 },
    modalOptionTxt: { fontSize: 16, fontWeight: '600', color: T.textLight },
    modalOptionTxtActive: { color: T.accent, fontWeight: '800' },
    modalCloseBtn: { marginTop: 24, height: 50, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
    modalCloseTxt: { fontSize: 15, fontWeight: '700', color: T.white },
});