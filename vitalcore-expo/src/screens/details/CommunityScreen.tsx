import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../services/supabase';
import { CustomTextInput } from '../../components/CustomTextInput';

interface CommunityPost {
  id: string;
  user_id: string;
  content: string;
  likes: number;
  created_at: string;
  author_name?: string;
  username?: string;
}

export default function CommunityScreen({ navigation }: any) {
  const { profile, user } = useAuth();
  const { colors } = useTheme();
  const [postText, setPostText] = useState('');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          id,
          user_id,
          content,
          likes,
          created_at,
          profiles:user_id (full_name, username)
        `)
        .order('created_at', { ascending: false });

      if (data && !error) {
        const formatted: CommunityPost[] = data.map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          content: item.content,
          likes: item.likes || 0,
          created_at: item.created_at,
          author_name: item.profiles?.full_name || 'VitalCore User',
          username: item.profiles?.username || 'user',
        }));
        setPosts(formatted);
      }
    } catch (e) {
      console.error('Error loading community posts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async () => {
    if (!postText.trim() || !user?.id) return;

    try {
      setSubmitting(true);
      const { error } = await supabase.from('community_posts').insert({
        user_id: user.id,
        content: postText.trim(),
        likes: 0,
      });

      if (!error) {
        setPostText('');
        fetchPosts();
      } else {
        Alert.alert('Error', error.message || 'Failed to submit post.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to submit post.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikePost = async (postId: string, currentLikes: number) => {
    try {
      const updatedLikes = currentLikes + 1;
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, likes: updatedLikes } : p))
      );
      await supabase
        .from('community_posts')
        .update({ likes: updatedLikes })
        .eq('id', postId);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainTabs', { screen: 'Home' }))}
          >
            <Text style={[styles.backBtnText, { color: colors.primary }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>👥 Community Feed</Text>
        </View>

        {/* Share Post Card */}
        <View style={[styles.createCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <CustomTextInput
            placeholder="Share a health update, milestone, or question with the community..."
            value={postText}
            onChangeText={setPostText}
            multiline
            height={80}
            containerStyle={{ marginBottom: 12 }}
          />
          <TouchableOpacity
            style={[styles.postButton, { backgroundColor: colors.primary }, (!postText.trim() || submitting) && styles.disabledBtn]}
            onPress={handleCreatePost}
            disabled={!postText.trim() || submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.postBtnText}>Post Update</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Feed List */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>Fetching community feed...</Text>
          </View>
        ) : posts.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No community posts yet. Be the first to share an update!</Text>
          </View>
        ) : (
          posts.map((post) => (
            <View key={post.id} style={[styles.postCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <View style={styles.postHeader}>
                <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                  <Text style={styles.avatarText}>
                    {post.author_name ? post.author_name.charAt(0).toUpperCase() : 'U'}
                  </Text>
                </View>
                <View style={styles.authorCol}>
                  <Text style={[styles.authorName, { color: colors.text }]}>{post.author_name}</Text>
                  <Text style={[styles.authorHandle, { color: colors.textMuted }]}>
                    @{post.username} • {new Date(post.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <Text style={[styles.postContent, { color: colors.text }]}>{post.content}</Text>

              <View style={[styles.postFooter, { borderTopColor: colors.cardBorder }]}>
                <TouchableOpacity
                  style={styles.likeBtn}
                  onPress={() => handleLikePost(post.id, post.likes)}
                >
                  <Text style={[styles.likeText, { color: colors.primary }]}>❤️ {post.likes} Likes</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    marginRight: 12,
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  createCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  postButton: {
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
    alignSelf: 'flex-end',
    paddingHorizontal: 20,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  postBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  loadingBox: {
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyBox: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  postCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  authorCol: {
    flex: 1,
  },
  authorName: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  authorHandle: {
    fontSize: 12,
  },
  postContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  postFooter: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  likeBtn: {
    paddingVertical: 4,
  },
  likeText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
});
