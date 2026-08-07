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
import { supabase } from '../../services/supabase';

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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>👥 Community Feed</Text>
        </View>

        {/* Share Post Card */}
        <View style={styles.createCard}>
          <TextInput
            style={styles.postInput}
            placeholder="Share a health update, milestone, or question with the community..."
            placeholderTextColor="#64748b"
            value={postText}
            onChangeText={setPostText}
            multiline
          />
          <TouchableOpacity
            style={[styles.postButton, (!postText.trim() || submitting) && styles.disabledBtn]}
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
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Fetching community feed...</Text>
          </View>
        ) : posts.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No community posts yet. Be the first to share an update!</Text>
          </View>
        ) : (
          posts.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {post.author_name ? post.author_name.charAt(0).toUpperCase() : 'U'}
                  </Text>
                </View>
                <View style={styles.authorCol}>
                  <Text style={styles.authorName}>{post.author_name}</Text>
                  <Text style={styles.authorHandle}>
                    @{post.username} • {new Date(post.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <Text style={styles.postContent}>{post.content}</Text>

              <View style={styles.postFooter}>
                <TouchableOpacity
                  style={styles.likeBtn}
                  onPress={() => handleLikePost(post.id, post.likes)}
                >
                  <Text style={styles.likeText}>❤️ {post.likes} Likes</Text>
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
    backgroundColor: '#0f172a',
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
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  createCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
  },
  postInput: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 12,
    color: '#f8fafc',
    fontSize: 14,
    minHeight: 70,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#334155',
  },
  postButton: {
    backgroundColor: '#3b82f6',
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
    color: '#94a3b8',
    marginTop: 12,
    fontSize: 14,
  },
  emptyBox: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
  },
  postCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
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
    backgroundColor: '#3b82f6',
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
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: 'bold',
  },
  authorHandle: {
    color: '#94a3b8',
    fontSize: 12,
  },
  postContent: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
  },
  postFooter: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  likeBtn: {
    paddingVertical: 4,
  },
  likeText: {
    color: '#3b82f6',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
