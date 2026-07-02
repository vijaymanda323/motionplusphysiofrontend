import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import API_BASE_URL from './config/api';

// ── findphysio.org Red/Orange/Gold Theme ───────────────────────
const T = {
  primary: '#9E0A0A', // Deep Crimson Red
  accent: '#FFE500', // Gold/Yellow
  teal: '#FF7043', // Orange (replacing teal)
  white: '#FFFFFF',
  bg: '#FFF5F5', // Soft warm white
  card: '#FFFFFF',
  text: '#2E1010', // Dark warm brown-red
  muted: '#8B7575', // Warm muted grey-red
  border: '#F2E2E2', // Warm light border
  light: 'rgba(158, 10, 10, 0.08)', // Soft translucent red
  orange: '#FFA000',
  red: '#C62828',
  dark: '#1A0202',
};

const ProfileRow = ({ label, value, editable, editValue, onEditChange, placeholder, icon }) => {
    const safeValue = value != null ? String(value) : '';
    const safeLabel = label != null ? String(label) : '';
    
    return (
        <View style={styles.row}>
            <View style={styles.rowLeft}>
                <View style={styles.rowIconWrap}>
                    <Text style={styles.rowIcon}>{icon || '📄'}</Text>
                </View>
                <View style={styles.rowTextWrap}>
                    <Text style={styles.labelText}>{safeLabel}</Text> 
                    {editable ? (
                        <TextInput
                            style={styles.editInput}
                            value={editValue}
                            onChangeText={onEditChange}
                            placeholder={placeholder || safeValue}
                            placeholderTextColor="#999"
                        />
                    ) : (
                        <Text style={styles.valueText}>{safeValue || 'Not Set'}</Text>
                    )}
                </View>
            </View>
        </View>
    );
};

export default function AboutYouScreen({ navigation }) {
    const route = useRoute();
    const userEmailFromParams = route.params?.userEmail;
    const insets = useSafeAreaInsets();
    
    const [profileData, setProfileData] = useState({
        height: '',
        weight: '',
        birthday: '',
        sex: '',
        displayName: '',
        location: 'Choose country',
        bio: 'Share your fitness goals',
        accountCreated: '',
        id: '',
        birthDate: '', 
        heightValue: '', 
        weightValue: '', 
    });
    const [loading, setLoading] = useState(true);
    const [editingProfile, setEditingProfile] = useState(false);
    const [editingSocial, setEditingSocial] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editForm, setEditForm] = useState({
        height: '',
        weight: '',
        birthDate: '',
        sex: '',
        displayName: '',
        location: '',
        bio: '',
    });

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        const email = userEmailFromParams;
        if (!email) {
            console.warn('No email provided to AboutYouScreen');
            setLoading(false);
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/users/profile/${email}`);
            const data = await response.json();
            
            if (response.ok && data.user) {
                const user = data.user;
                
                let birthdayFormatted = '';
                if (user.birthDate) {
                    const birthDate = new Date(user.birthDate);
                    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                                   'July', 'August', 'September', 'October', 'November', 'December'];
                    birthdayFormatted = `${months[birthDate.getMonth()]} ${birthDate.getDate()}, ${birthDate.getFullYear()}`;
                }
                
                let accountCreatedFormatted = '';
                if (user.createdAt) {
                    const createdDate = new Date(user.createdAt);
                    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                                   'July', 'August', 'September', 'October', 'November', 'December'];
                    accountCreatedFormatted = `${months[createdDate.getMonth()]} ${createdDate.getDate()}, ${createdDate.getFullYear()}`;
                }
                
                setProfileData({
                    height: user.height ? `${user.height} cm` : '',
                    weight: user.weight ? `${user.weight} kg` : '',
                    birthday: birthdayFormatted,
                    sex: user.gender || '',
                    displayName: user.firstName || user.name || '',
                    location: user.location || 'Choose country',
                    bio: user.bio || 'Share your fitness goals',
                    accountCreated: accountCreatedFormatted,
                    id: user.id || user._id?.toString().substring(0, 6).toUpperCase() || '',
                    birthDate: user.birthDate || '',
                    heightValue: user.height || '',
                    weightValue: user.weight || '',
                });
                
                setEditForm({
                    height: user.height ? String(user.height) : '',
                    weight: user.weight ? String(user.weight) : '',
                    birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
                    sex: user.gender || '',
                    displayName: user.firstName || user.name || '',
                    location: user.location || 'Choose country',
                    bio: user.bio || 'Share your fitness goals',
                });
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditProfile = () => {
        setEditingProfile(true);
    };

    const handleEditSocial = () => {
        setEditingSocial(true);
    };

    const handleCancelEdit = () => {
        setEditingProfile(false);
        setEditingSocial(false);
        setEditForm({
            height: profileData.heightValue ? String(profileData.heightValue) : '',
            weight: profileData.weightValue ? String(profileData.weightValue) : '',
            birthDate: profileData.birthDate ? new Date(profileData.birthDate).toISOString().split('T')[0] : '',
            sex: profileData.sex || '',
            displayName: profileData.displayName || '',
            location: profileData.location || 'Choose country',
            bio: profileData.bio || 'Share your fitness goals',
        });
    };

    const handleSaveProfile = async () => {
        if (!userEmailFromParams) {
            Alert.alert('Error', 'User email not found');
            return;
        }

        setSaving(true);
        try {
            const profileDataToSave = {
                email: userEmailFromParams.trim().toLowerCase(),
                firstName: editForm.displayName.trim(),
                height: parseFloat(editForm.height) || 0,
                weight: parseFloat(editForm.weight) || 0,
                sex: editForm.sex,
                birthDate: editForm.birthDate || undefined,
            };

            let saveSuccessful = false;
            try {
                const response = await fetch(`${API_BASE_URL}/users/profile`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(profileDataToSave),
                });

                if (response.ok) {
                    saveSuccessful = true;
                }
            } catch (backendError) {
                console.warn('Backend connection failed:', backendError.message);
            }

            if (saveSuccessful) {
                await fetchUserProfile();
            } else {
                let birthdayFormatted = '';
                if (editForm.birthDate) {
                    try {
                        const birthDate = new Date(editForm.birthDate);
                        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                                       'July', 'August', 'September', 'October', 'November', 'December'];
                        birthdayFormatted = `${months[birthDate.getMonth()]} ${birthDate.getDate()}, ${birthDate.getFullYear()}`;
                    } catch (e) {
                        birthdayFormatted = editForm.birthDate;
                    }
                }
                
                setProfileData(prev => ({
                    ...prev,
                    height: editForm.height ? `${editForm.height} cm` : '',
                    weight: editForm.weight ? `${editForm.weight} kg` : '',
                    birthday: birthdayFormatted || prev.birthday,
                    sex: editForm.sex || prev.sex,
                    displayName: editForm.displayName || prev.displayName,
                    heightValue: editForm.height || prev.heightValue,
                    weightValue: editForm.weight || prev.weightValue,
                    birthDate: editForm.birthDate || prev.birthDate,
                }));
            }

            setEditingProfile(false);
            Alert.alert('Success', 'Profile updated successfully' + (saveSuccessful ? '' : ' (offline mode)'));
        } catch (error) {
            console.error('Error saving profile:', error);
            Alert.alert('Error', error.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveSocial = async () => {
        if (!userEmailFromParams) {
            Alert.alert('Error', 'User email not found');
            return;
        }

        setSaving(true);
        try {
            const profileDataToSave = {
                email: userEmailFromParams.trim().toLowerCase(),
                firstName: editForm.displayName.trim(),
            };

            let saveSuccessful = false;
            try {
                const response = await fetch(`${API_BASE_URL}/users/profile`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(profileDataToSave),
                });

                if (response.ok) {
                    saveSuccessful = true;
                }
            } catch (backendError) {
                console.warn('Backend connection failed:', backendError.message);
            }

            setProfileData(prev => ({
                ...prev,
                displayName: editForm.displayName,
                location: editForm.location,
                bio: editForm.bio,
            }));

            setEditingSocial(false);
            Alert.alert('Success', 'Social profile updated successfully' + (saveSuccessful ? '' : ' (offline mode)'));
        } catch (error) {
            console.error('Error saving social profile:', error);
            Alert.alert('Error', error.message || 'Failed to update social profile');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: () => {
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Welcome' }],
                        });
                    },
                },
            ],
            { cancelable: true }
        );
    };

    return (
        <View style={styles.safeArea}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="arrow-left" size={22} color={T.white} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Patient Profile Portal</Text>
                    <Text style={styles.headerSub}>Manage your health and clinical metrics</Text>
                </View>
                <View style={styles.headerRight}>
                    <View style={styles.medCross}><Text style={styles.medCrossText}>+</Text></View>
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={T.primary} />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* Hero profile card */}
                <View style={styles.profileHeroCard}>
                    <View style={styles.profileAvatarBox}>
                        <Text style={styles.profileAvatarText}>
                            {profileData.displayName ? profileData.displayName.charAt(0).toUpperCase() : 'P'}
                        </Text>
                    </View>
                    <View style={styles.profileHeroInfo}>
                        <Text style={styles.profileHeroName}>{profileData.displayName || 'Patient'}</Text>
                        <Text style={styles.profileHeroSub}>Patient ID: MP-{profileData.id || '000000'}</Text>
                        <View style={styles.profileStatusTag}>
                            <View style={styles.statusDot} />
                            <Text style={styles.statusText}>Active Patient</Text>
                        </View>
                    </View>
                </View>

                {/* Profile Information Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Physical Parameters</Text>
                    {!editingProfile ? (
                        <TouchableOpacity onPress={handleEditProfile} style={styles.editButtonContainer}>
                            <Feather name="edit-2" size={14} color={T.primary} />
                            <Text style={styles.editButton}>Edit</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.editActions}>
                            <TouchableOpacity onPress={handleCancelEdit} disabled={saving} style={styles.cancelBtnContainer}>
                                <Text style={styles.cancelButton}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSaveProfile} disabled={saving} style={styles.saveBtnContainer}>
                                {saving ? (
                                    <ActivityIndicator size="small" color={T.white} />
                                ) : (
                                    <Text style={styles.saveButton}>Save</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <Text style={styles.description}>
                    These clinical metrics are used to customize therapy routines, calculate muscle loading, and provide alerts.
                </Text>

                <View style={styles.card}>
                    <ProfileRow 
                        label="Height" 
                        value={profileData.height} 
                        editable={editingProfile}
                        editValue={editForm.height}
                        onEditChange={(text) => setEditForm(prev => ({ ...prev, height: text }))}
                        placeholder="Enter height in cm"
                        icon="📏"
                    />
                    <View style={styles.divider} />
                    
                    <ProfileRow 
                        label="Weight" 
                        value={profileData.weight} 
                        editable={editingProfile}
                        editValue={editForm.weight}
                        onEditChange={(text) => setEditForm(prev => ({ ...prev, weight: text }))}
                        placeholder="Enter weight in kg"
                        icon="⚖️"
                    />
                    <View style={styles.divider} />

                    <ProfileRow 
                        label="Birthday" 
                        value={profileData.birthday} 
                        editable={editingProfile}
                        editValue={editForm.birthDate}
                        onEditChange={(text) => setEditForm(prev => ({ ...prev, birthDate: text }))}
                        placeholder="YYYY-MM-DD"
                        icon="📅"
                    />
                    <View style={styles.divider} />
                    
                    <ProfileRow 
                        label="Biological Sex" 
                        value={profileData.sex} 
                        editable={editingProfile}
                        editValue={editForm.sex}
                        onEditChange={(text) => setEditForm(prev => ({ ...prev, sex: text }))}
                        placeholder="Male, Female, Other"
                        icon="🧬"
                    />
                </View>

                {/* Social Profile Section */}
                <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                    <Text style={styles.sectionTitle}>Social profile</Text>
                    {!editingSocial ? (
                        <TouchableOpacity onPress={handleEditSocial} style={styles.editButtonContainer}>
                            <Feather name="edit-2" size={14} color={T.primary} />
                            <Text style={styles.editButton}>Edit</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.editActions}>
                            <TouchableOpacity onPress={handleCancelEdit} disabled={saving} style={styles.cancelBtnContainer}>
                                <Text style={styles.cancelButton}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSaveSocial} disabled={saving} style={styles.saveBtnContainer}>
                                {saving ? (
                                    <ActivityIndicator size="small" color={T.white} />
                                ) : (
                                    <Text style={styles.saveButton}>Save</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
                
                <Text style={styles.description}>
                   Customize how your name appears to physiotherapists and community groups.
                </Text>

                <View style={styles.card}>
                    <ProfileRow 
                        label="Display name" 
                        value={profileData.displayName} 
                        editable={editingSocial}
                        editValue={editForm.displayName}
                        onEditChange={(text) => setEditForm(prev => ({ ...prev, displayName: text }))}
                        placeholder="Enter display name"
                        icon="👤"
                    />
                    <View style={styles.divider} />
                    
                    <ProfileRow 
                        label="Location / Country" 
                        value={profileData.location} 
                        editable={editingSocial}
                        editValue={editForm.location}
                        onEditChange={(text) => setEditForm(prev => ({ ...prev, location: text }))}
                        placeholder="Enter location"
                        icon="📍"
                    />
                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <View style={styles.rowLeft}>
                            <View style={styles.rowIconWrap}><Text style={styles.rowIcon}>💬</Text></View>
                            <View style={styles.rowTextWrap}>
                                <Text style={styles.labelText}>Your bio & fitness goals</Text>
                                {editingSocial ? (
                                    <TextInput
                                        style={[styles.editInput, styles.bioInput]}
                                        value={editForm.bio}
                                        onChangeText={(text) => setEditForm(prev => ({ ...prev, bio: text }))}
                                        placeholder="Share your fitness goals"
                                        placeholderTextColor="#999"
                                        multiline
                                        numberOfLines={3}
                                    />
                                ) : (
                                    <Text style={styles.valueText}>{profileData.bio}</Text>
                                )}
                            </View>
                        </View>
                    </View>
                    <View style={styles.divider} />
                    
                    <TouchableOpacity style={styles.privacyButton}>
                        <Text style={styles.privacyButtonText}>🛡️ Review Privacy Settings</Text>
                    </TouchableOpacity>
                </View>

                {/* Account Section */}
                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Verification & Registration</Text>
                
                <View style={styles.card}>
                    <ProfileRow label="Registration Date" value={profileData.accountCreated} icon="⏱️" />
                    <View style={styles.divider} />
                    <ProfileRow label="Security Patient ID" value={profileData.id} icon="🔑" />
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Feather name="log-out" size={18} color={T.red} />
                    <Text style={styles.logoutButtonText}>Sign Out from Account</Text>
                </TouchableOpacity>
                
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: T.bg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        paddingVertical: 14,
        backgroundColor: T.primary,
        shadowColor: T.dark,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 8,
    },
    backButton: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: T.white,
    },
    headerSub: {
        fontSize: 11,
        color: "rgba(227,242,253,0.75)",
        marginTop: 2,
    },
    headerCenter: {
        flex: 1,
        marginLeft: 12,
    },
    headerRight: {
        alignItems: 'center',
    },
    medCross: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: "rgba(255,255,255,0.15)",
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.25)",
    },
    medCrossText: {
        color: T.white,
        fontSize: 20,
        fontWeight: '900',
        lineHeight: 24,
    },

    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },

    /* Profile Hero */
    profileHeroCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: T.primary,
        borderRadius: 22,
        padding: 20,
        marginBottom: 20,
        shadowColor: T.primary,
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    profileAvatarBox: {
        width: 68,
        height: 68,
        borderRadius: 22,
        backgroundColor: T.white,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    profileAvatarText: {
        fontSize: 28,
        fontWeight: '900',
        color: T.primary,
    },
    profileHeroInfo: {
        flex: 1,
    },
    profileHeroName: {
        fontSize: 20,
        fontWeight: '900',
        color: T.white,
    },
    profileHeroSub: {
        fontSize: 12,
        color: 'rgba(227,242,253,0.8)',
        marginTop: 2,
    },
    profileStatusTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        marginTop: 8,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: T.teal,
        marginRight: 6,
    },
    statusText: {
        fontSize: 10,
        color: T.white,
        fontWeight: '700',
    },

    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '900',
        color: T.text,
    },
    editButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: T.light,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    editButton: {
        color: T.primary,
        fontSize: 13,
        fontWeight: '800',
    },
    editActions: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    cancelBtnContainer: {
        backgroundColor: '#F1F3F5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    cancelButton: {
        color: T.muted,
        fontSize: 13,
        fontWeight: '700',
    },
    saveBtnContainer: {
        backgroundColor: T.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        minWidth: 50,
        alignItems: 'center',
    },
    saveButton: {
        color: T.white,
        fontSize: 13,
        fontWeight: '800',
    },
    editInput: {
        fontSize: 15,
        color: T.text,
        borderWidth: 1.5,
        borderColor: T.border,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginTop: 6,
        backgroundColor: '#F8FAFC',
        fontWeight: '500',
    },
    bioInput: {
        minHeight: 70,
        textAlignVertical: 'top',
    },
    description: {
        fontSize: 12,
        color: T.muted,
        marginBottom: 14,
        lineHeight: 18,
    },
    card: {
        backgroundColor: T.card,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: T.border,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 3,
        marginBottom: 10,
    },
    row: {
        paddingVertical: 14, 
        paddingHorizontal: 18,
        justifyContent: 'center',
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowIconWrap: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: T.border,
    },
    rowIcon: {
        fontSize: 18,
    },
    rowTextWrap: {
        flex: 1,
    },
    labelText: {
        fontSize: 11,
        color: T.muted,
        fontWeight: '700',
        letterSpacing: 0.5,
        marginBottom: 2, 
    },
    valueText: {
        fontSize: 14,
        color: T.text,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: T.border,
        marginLeft: 18,
    },
    privacyButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: T.light,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginTop: 6,
        marginBottom: 14,
        marginLeft: 18,
        borderWidth: 1,
        borderColor: 'rgba(158,10,10,0.15)',
    },
    privacyButtonText: {
        color: T.primary,
        fontWeight: '800',
        fontSize: 12,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: T.card,
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: T.red,
        marginTop: 24,
        marginBottom: 20,
        shadowColor: T.red,
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    logoutButtonText: {
        color: T.red,
        fontSize: 15,
        fontWeight: '800',
    },
});
