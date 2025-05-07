import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import React, { useRef, useState } from 'react';
import { Modal, Platform, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraReady, setCameraReady] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  // Correct zoom values for Expo Camera (0-1 range)
  const [zoomIndex, setZoomIndex] = useState(0);
  const zoomLevels = [0, 0.1, 0.3, 0.5]; 
  const zoomLabels = ['0.5x', '1x', '2x', '3x'];
  
  const cameraRef = useRef(null);

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
    // Reset zoom when switching cameras
    setZoomIndex(0);
  };

  const toggleInstructions = () => {
    setShowInstructions(!showInstructions);
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const switchLens = () => {
    // Only allow lens switching for back camera
    if (facing === 'front') return;
    
    const nextIndex = (zoomIndex + 1) % zoomLevels.length;
    setZoomIndex(nextIndex);
  };

  // Get the current zoom level based on the zoom index
  const getCurrentZoom = () => zoomLevels[zoomIndex];
  
  // Get the current zoom label based on the zoom index
  const getCurrentLabel = () => zoomLabels[zoomIndex];

  if (!permission) {
    // Camera permissions are still loading
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Requesting camera permissions...</ThemedText>
      </ThemedView>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={{ textAlign: 'center', marginBottom: 20 }}>
          We need your permission to show the camera
        </ThemedText>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <ThemedText style={styles.buttonText}>Grant Permission</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <View style={styles.fullScreenContainer}>
      <StatusBar hidden />
      
      {/* CameraView with proper zoom setting */}
      <CameraView
        ref={cameraRef}
        style={styles.fullScreenCamera}
        facing={facing}
        zoom={getCurrentZoom()}
        onCameraReady={() => setCameraReady(true)}
      />
      
      {/* Lens indicator overlay */}
      {showControls && facing === 'back' && (
        <View style={styles.lensIndicator}>
          <ThemedText style={styles.lensText}>{getCurrentLabel()}</ThemedText>
        </View>
      )}
      
      {/* Controls as sibling with absolute positioning */}
      {showControls && (
        <View style={styles.floatingControls}>
          <TouchableOpacity style={styles.iconButton} onPress={toggleCameraFacing}>
            <ThemedText style={styles.buttonText}>Flip</ThemedText>
          </TouchableOpacity>
          
          {Platform.OS === 'ios' && facing === 'back' && (
            <TouchableOpacity style={styles.iconButton} onPress={switchLens}>
              <ThemedText style={styles.buttonText}>Lens</ThemedText>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.iconButton} onPress={toggleInstructions}>
            <ThemedText style={styles.buttonText}>Help</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.iconButton} onPress={toggleControls}>
            <ThemedText style={styles.buttonText}>Hide UI</ThemedText>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Touchable overlay to show controls */}
      {!showControls && (
        <TouchableOpacity 
          style={styles.fullScreenTouchable} 
          onPress={toggleControls}
        />
      )}

      <Modal
        visible={showInstructions}
        transparent={true}
        animationType="slide"
        onRequestClose={toggleInstructions}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ThemedText type="subtitle" style={styles.modalTitle}>How to use with OBS Studio:</ThemedText>
            
            <ThemedText style={styles.instructionText}>
              1. In OBS, add a new "Browser Source" (not a Video Capture Device)
            </ThemedText>
            <ThemedText style={styles.instructionText}>
              2. Set the URL to your app's web address
            </ThemedText>
            <ThemedText style={styles.instructionText}>
              3. Set width and height (recommended: 1280x720)
            </ThemedText>
            <ThemedText style={styles.instructionText}>
              4. Click "Hide UI" button before streaming to hide controls
            </ThemedText>
            <ThemedText style={styles.instructionText}>
              5. Tap anywhere on screen to show controls again
            </ThemedText>
            
            <TouchableOpacity style={styles.closeButton} onPress={toggleInstructions}>
              <ThemedText style={styles.buttonText}>Close</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  lensIndicator: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderRadius: 4,
    zIndex: 10,
  },
  lensText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  fullScreenCamera: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  fullScreenTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingControls: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    zIndex: 10,
  },
  iconButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.7)',
    padding: 15,
    borderRadius: 50,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'stretch',
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
  },
  instructionText: {
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
    alignSelf: 'center',
  },
});