document.addEventListener('DOMContentLoaded', () => {
    const videoUpload = document.getElementById('video-upload');
    const videoDetails = document.getElementById('video-details');
    const videoList = document.getElementById('uploaded-videos');
    const videoLinkInput = document.getElementById('video-link');
    const submitLinkBtn = document.getElementById('submit-link');
    const remoteVideo = document.getElementById('remote-video');
    let uploadedVideos = [];
    const MAX_VIDEOS = 10;
    let eventListeners = [];

    function clearAllVideos() {
        uploadedVideos.forEach(video => {
            URL.revokeObjectURL(video.blob);
        });
        uploadedVideos = [];
        videoList.innerHTML = '';
        videoUpload.value = '';
    }

    function removeVideo(index) {
        URL.revokeObjectURL(uploadedVideos[index].blob);
        // Remove all event listeners associated with this video
        eventListeners.forEach(listener => {
            if (listener.index === index) {
                listener.element.removeEventListener(listener.type, listener.handler);
            }
        });
        eventListeners = eventListeners.filter(l => l.index !== index);
        uploadedVideos.splice(index, 1);
        updateVideoList();
    }

    function createDeleteButton() {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete Video';
        deleteBtn.style.cssText = `
            background: #ff3b30;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 10px;
            width: 100%;
            transition: background 0.3s;
        `;
        deleteBtn.addEventListener('mouseover', () => {
            deleteBtn.style.background = '#ff1f23';
        });
        deleteBtn.addEventListener('mouseout', () => {
            deleteBtn.style.background = '#ff3b30';
        });
        return deleteBtn;
    }

    function updateVideoList() {
        videoList.innerHTML = '';
        uploadedVideos.forEach((video, index) => {
            const videoItem = document.createElement('div');
            videoItem.className = 'video-item';
            videoItem.innerHTML = `
                <p><strong>File Name:</strong> ${video.name}</p>
                <p><strong>Size:</strong> ${video.size} MB</p>
                <p><strong>Duration:</strong> ${video.duration}</p>
                <p><strong>Type:</strong> ${video.type}</p>
            `;
            const deleteBtn = createDeleteButton();
            const deleteHandler = () => removeVideo(index);
            deleteBtn.addEventListener('click', deleteHandler);
            eventListeners.push({
                element: deleteBtn,
                type: 'click',
                handler: deleteHandler,
                index: index
            });
            videoItem.appendChild(deleteBtn);
            videoList.appendChild(videoItem);
        });
    }

    submitLinkBtn.addEventListener('click', () => {
        const videoUrl = videoLinkInput.value.trim();
        if (videoUrl) {
            remoteVideo.src = videoUrl;
            remoteVideo.style.display = 'block';
            document.querySelector('#remote-video-container .no-video').style.display = 'none';
            remoteVideo.play().catch(error => {
                console.error('Error playing video:', error);
                alert('Error playing video. Please check the URL and try again.');
            });
            videoLinkInput.value = '';
        } else {
            alert('Please enter a valid video URL');
        }
    });

    let isCallActive = false;
    let localStream = null;

    const startCallBtn = document.getElementById('start-call');
    const endCallBtn = document.getElementById('end-call');
    const cameraToggleBtn = document.getElementById('camera-toggle');
    const localVideo = document.getElementById('local-video');

    async function startCamera() {
        try {
            localStream = await navigator.mediaDevices.getUserMedia({ video: true });
            localVideo.srcObject = localStream;
            document.querySelector('#local-video-container .no-video').style.display = 'none';
            localVideo.style.display = 'block';
            cameraToggleBtn.textContent = 'Disable Camera';
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Error accessing camera. Please check your camera permissions.');
        }
    }

    function stopCamera() {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            localVideo.srcObject = null;
            localStream = null;
            document.querySelector('#local-video-container .no-video').style.display = 'flex';
            localVideo.style.display = 'none';
            cameraToggleBtn.textContent = 'Enable Camera';
        }
    }

    cameraToggleBtn.addEventListener('click', () => {
        if (localStream) {
            stopCamera();
        } else {
            startCamera();
        }
    });

    startCallBtn.addEventListener('click', async () => {
        const remoteVideo = document.getElementById('remote-video');
        if (uploadedVideos.length > 0 || remoteVideo.src) {
            isCallActive = true;
            if (uploadedVideos.length > 0) {
                const latestVideo = uploadedVideos[uploadedVideos.length - 1];
                remoteVideo.src = latestVideo.blob;
            }
            remoteVideo.style.display = 'block';
            document.querySelector('#remote-video-container .no-video').style.display = 'none';
            startCallBtn.disabled = true;
            endCallBtn.disabled = false;
            
            // Automatically enable camera when starting call
            if (!localStream) {
                await startCamera();
            }
            
            remoteVideo.play().catch(error => {
                console.error('Error playing video:', error);
                alert('Error playing video. Please try again.');
            });

            remoteVideo.addEventListener('ended', function videoEndHandler() {
                if (isCallActive) {
                    remoteVideo.currentTime = 0;
                    remoteVideo.play().catch(error => {
                        console.error('Error replaying video:', error);
                    });
                }
            });
        } else {
            alert('Please upload a video or enter a video URL first.');
        }
    });

    endCallBtn.addEventListener('click', () => {
        isCallActive = false;
        const remoteVideo = document.getElementById('remote-video');
        remoteVideo.pause();
        remoteVideo.currentTime = 0;
        remoteVideo.style.display = 'none';
        document.querySelector('#remote-video-container .no-video').style.display = 'block';
        startCallBtn.disabled = false;
        endCallBtn.disabled = true;
        
        // Automatically stop the camera when ending call
        stopCamera();
    });
    function updateVideoList() {
        videoList.innerHTML = '';
        uploadedVideos.forEach((video, index) => {
            const videoItem = document.createElement('div');
            videoItem.className = 'video-item';
            videoItem.innerHTML = `
                <p><strong>File Name:</strong> ${video.name}</p>
                <p><strong>Size:</strong> ${video.size} MB</p>
                <p><strong>Duration:</strong> ${video.duration}</p>
                <p><strong>Type:</strong> ${video.type}</p>
            `;
            const deleteBtn = createDeleteButton();
            const deleteHandler = () => removeVideo(index);
            deleteBtn.addEventListener('click', deleteHandler);
            eventListeners.push({
                element: deleteBtn,
                type: 'click',
                handler: deleteHandler,
                index: index
            });
            videoItem.appendChild(deleteBtn);
            videoList.appendChild(videoItem);
        });
    }

    videoUpload.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            if (uploadedVideos.length + files.length > MAX_VIDEOS) {
                alert(`You can only upload up to ${MAX_VIDEOS} videos. Please remove some videos first.`);
                return;
            }

            for (const file of files) {
                const video = document.createElement('video');
                video.preload = 'metadata';
                const blob = URL.createObjectURL(file);
                video.src = blob;

                await new Promise(resolve => {
                    video.onloadedmetadata = () => {
                        const duration = Math.round(video.duration);
                        const minutes = Math.floor(duration / 60);
                        const seconds = duration % 60;
                        const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                        const size = (file.size / (1024 * 1024)).toFixed(2);

                        uploadedVideos.push({
                            name: file.name,
                            size: size,
                            duration: formattedDuration,
                            type: file.type,
                            blob: blob
                        });
                        resolve();
                    };
                });
            }
            updateVideoList();
            videoUpload.value = '';
        }
    });
});

const remoteVideo = document.getElementById('remote-video');
const playPauseBtn = document.getElementById('play-pause-btn');
const rewindBtn = document.getElementById('rewind-btn');
const fastForwardBtn = document.getElementById('fast-forward-btn');
const videoProgress = document.querySelector('.video-progress');
const progressBar = document.querySelector('.progress-bar');

// Video control functions
playPauseBtn.addEventListener('click', () => {
    if (remoteVideo.paused) {
        remoteVideo.play();
    } else {
        remoteVideo.pause();
    }
});

fastForwardBtn.addEventListener('click', () => {
    remoteVideo.playbackRate = Math.min(remoteVideo.playbackRate + 0.5, 2.0);
});

rewindBtn.addEventListener('click', () => {
    remoteVideo.playbackRate = Math.max(remoteVideo.playbackRate - 0.5, 0.5);
});

// Update progress bar
remoteVideo.addEventListener('timeupdate', () => {
    const progress = (remoteVideo.currentTime / remoteVideo.duration) * 100;
    progressBar.style.width = `${progress}%`;
});

// Click on progress bar to seek
videoProgress.addEventListener('click', (e) => {
    const rect = videoProgress.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / videoProgress.offsetWidth;
    remoteVideo.currentTime = pos * remoteVideo.duration;
});