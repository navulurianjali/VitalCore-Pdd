import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Image,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useTheme } from '../../context/ThemeContext';
import { Camera, RefreshCw, X, ArrowLeft, Check, Sparkles } from 'lucide-react-native';

export default function CameraScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const cameraRef = React.useRef<any>(null);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, []);

  if (!permission) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.textMuted }]}>Requesting Camera Permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.topHeader}>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.surface }]} onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.centerBox}>
          <Camera size={48} color={colors.primary} style={{ marginBottom: 16 }} />
          <Text style={[styles.permissionTitle, { color: colors.text }]}>Camera Access Required</Text>
          <Text style={[styles.permissionSub, { color: colors.textMuted }]}>
            VitalCore AI requires camera access to scan food meals and body alignment for precision health telemetry.
          </Text>
          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={requestPermission}>
            <Text style={styles.primaryBtnText}>Grant Camera Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const toggleFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        setProcessing(true);
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
        setCapturedImage(photo.uri);
      } catch (e) {
        console.error('Camera capture error:', e);
      } finally {
        setProcessing(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.containerBlack}>
      {/* Top Floating Controls */}
      <View style={styles.overlayTop}>
        <TouchableOpacity style={styles.circleBtn} onPress={() => navigation.goBack()}>
          <X size={20} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Meal / Form Scanner</Text>
        <TouchableOpacity style={styles.circleBtn} onPress={toggleFacing}>
          <RefreshCw size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Main Camera View or Captured Photo Preview */}
      {capturedImage ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.previewImage} resizeMode="cover" />

          <View style={styles.previewControls}>
            <TouchableOpacity style={[styles.previewBtn, { backgroundColor: '#334155' }]} onPress={() => setCapturedImage(null)}>
              <X size={18} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.previewBtnText}>Retake</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.previewBtn, { backgroundColor: colors.primary }]}
              onPress={() => {
                // Navigate back to Calorie Tracker with scanned meal flag
                navigation.navigate('CalorieTrackerDetail');
              }}
            >
              <Check size={18} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.previewBtnText}>Use Scan</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.cameraWrapper}>
          <CameraView ref={cameraRef} style={styles.cameraView} facing={facing}>
            <View style={styles.viewfinderFrame}>
              <View style={styles.cornerTL} />
              <View style={styles.cornerTR} />
              <View style={styles.cornerBL} />
              <View style={styles.cornerBR} />
            </View>

            {/* Bottom Shutter Controls */}
            <View style={styles.overlayBottom}>
              <TouchableOpacity
                style={[styles.shutterBtn, processing && styles.disabledShutter]}
                onPress={takePicture}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <View style={styles.shutterInner} />
                )}
              </TouchableOpacity>
            </View>
          </CameraView>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  containerBlack: { flex: 1, backgroundColor: '#000000' },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  infoText: { marginTop: 12, fontSize: 14 },
  permissionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  permissionSub: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  primaryBtn: { height: 48, borderRadius: 12, paddingHorizontal: 24, justifyContent: 'center', alignItems: 'center' },
  primaryBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  topHeader: { paddingHorizontal: 20, paddingTop: 10 },
  iconBtn: { padding: 8, borderRadius: 16, alignSelf: 'flex-start' },
  overlayTop: {
    position: 'absolute',
    top: 48,
    left: 20,
    right: 20,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  circleBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  topTitle: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  cameraWrapper: { flex: 1 },
  cameraView: { flex: 1, justifyContent: 'space-between' },
  viewfinderFrame: {
    width: 260,
    height: 260,
    alignSelf: 'center',
    marginTop: 140,
    position: 'relative',
  },
  cornerTL: { position: 'absolute', top: 0, left: 0, width: 24, height: 24, borderTopWidth: 3, borderLeftWidth: 3, borderColor: '#3b82f6' },
  cornerTR: { position: 'absolute', top: 0, right: 0, width: 24, height: 24, borderTopWidth: 3, borderRightWidth: 3, borderColor: '#3b82f6' },
  cornerBL: { position: 'absolute', bottom: 0, left: 0, width: 24, height: 24, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: '#3b82f6' },
  cornerBR: { position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderBottomWidth: 3, borderRightWidth: 3, borderColor: '#3b82f6' },
  overlayBottom: { paddingBottom: 40, alignItems: 'center' },
  shutterBtn: { width: 72, height: 72, borderRadius: 36, borderWidth: 4, borderColor: '#ffffff', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)' },
  shutterInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#ffffff' },
  disabledShutter: { opacity: 0.5 },
  previewContainer: { flex: 1, justifyContent: 'space-between' },
  previewImage: { flex: 1, width: '100%' },
  previewControls: { flexDirection: 'row', padding: 24, justifyContent: 'space-around', backgroundColor: '#0f172a' },
  previewBtn: { height: 48, borderRadius: 12, paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  previewBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
});
