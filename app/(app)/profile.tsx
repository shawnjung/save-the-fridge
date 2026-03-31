import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/lib/store/authStore';
import { supabase } from '@/lib/supabase';
import { COLORS } from '@/constants/theme';

export default function ProfileScreen() {
  const { profile, refreshProfile, signOut } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!profile) return;
    setLoading(true);
    setError('');
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ display_name: displayName.trim() || null })
        .eq('id', profile.id);

      if (updateError) throw updateError;
      await refreshProfile();
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePickAvatar = async () => {
    if (!profile) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (result.canceled || !result.assets[0]) return;

    setLoading(true);
    try {
      const asset = result.assets[0];
      const ext = asset.uri.split('.').pop() ?? 'jpg';
      const fileName = `${profile.id}.${ext}`;

      const response = await fetch(asset.uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', profile.id);

      await refreshProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarSection}>
        <Avatar
          uri={profile.avatar_url}
          name={profile.display_name ?? profile.username}
          size={96}
        />
        <Button
          title="Change Photo"
          onPress={handlePickAvatar}
          variant="outline"
          size="sm"
          style={styles.changePhotoButton}
          loading={loading}
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Username</Text>
          <Text style={styles.infoValue}>@{profile.username}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Display Name</Text>
          {editing ? (
            <TextInput
              style={styles.editInput}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your display name"
              placeholderTextColor={COLORS.textSecondary}
            />
          ) : (
            <Text style={styles.infoValue}>{profile.display_name ?? '—'}</Text>
          )}
        </View>
      </View>

      {editing ? (
        <View style={styles.buttonRow}>
          <Button
            title="Cancel"
            onPress={() => {
              setEditing(false);
              setDisplayName(profile.display_name ?? '');
            }}
            variant="outline"
            style={styles.flex}
          />
          <Button title="Save" onPress={handleSave} loading={loading} style={styles.flex} />
        </View>
      ) : (
        <Button title="Edit Profile" onPress={() => setEditing(true)} variant="outline" />
      )}

      <Button
        title="Sign Out"
        onPress={signOut}
        variant="danger"
        style={styles.signOutButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 24,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  changePhotoButton: {
    marginTop: 12,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoRow: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: COLORS.text,
  },
  editInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  error: {
    color: COLORS.danger,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: 40,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  signOutButton: {
    marginTop: 40,
  },
});
