<script>
  import { onMount } from 'svelte';
  export let item = null;
  export let onClose = () => {};
  
  let dialog;
  let isVideo = false;
  let contentHtml = '';
  
  onMount(async () => {
    try {
      const response = await fetch(`/api/get_content?itemid=${item.itemid}`);
      const data = await response.json();
      
      if (data.success) {
        const description = data.description;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = description;

        const videoElement = tempDiv.querySelector('video');
        const youtubeIframe = Array.from(tempDiv.querySelectorAll('iframe'))
          .find(iframe => iframe.src.includes('youtube') || iframe.src.includes('bilibili'));

        if (youtubeIframe || videoElement) {
          isVideo = true;
          let videoHtml;
          
          if (youtubeIframe) {
            const youtubeSource = youtubeIframe.src;
            videoHtml = `<iframe width="1440" height="810" src="${youtubeSource}" frameborder="0" allowfullscreen></iframe>`;
          } else {
            const resolutionMatch = videoElement.src.match(/(\d+)x(\d+)/);
            let videoWidth = 1440;
            let videoHeight = 810;

            if (resolutionMatch) {
              videoWidth = parseInt(resolutionMatch[1]);
              videoHeight = parseInt(resolutionMatch[2]);
            }

            const aspectRatio = videoWidth / videoHeight;
            const maxWidth = Math.min(window.innerWidth, 1440);
            const maxHeight = Math.min(window.innerHeight, 1080);

            if (aspectRatio > 1) {
              videoWidth = maxWidth;
              videoHeight = videoWidth / aspectRatio;
            } else {
              videoHeight = maxHeight;
              videoWidth = videoHeight * aspectRatio;
            }

            videoWidth = Math.min(videoWidth, maxWidth);
            videoHeight = Math.min(videoHeight, maxHeight);

            videoHtml = `<video width="${videoWidth}" height="${videoHeight}" controls src="${videoElement.src}" frameborder="0" allowfullscreen></video>`;
          }
          
          contentHtml = videoHtml;
        } else {
          contentHtml = `<img src="${item.image_url}" alt="Full image" class="max-w-full max-h-[90vh] object-contain">`;
        }

        dialog?.showModal();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });

  function handleClick(event) {
    if (isVideo) {
      const dialogContent = dialog.querySelector('.dialog-content');
      if (!dialogContent.contains(event.target)) {
        onClose();
      }
    } else {
      onClose();
    }
  }
</script>

<dialog
  bind:this={dialog}
  class="bg-transparent p-0 m-0 w-full h-full max-w-none max-h-none backdrop:bg-black backdrop:bg-opacity-75"
  on:click={handleClick}
>
  <div class="dialog-content flex items-center justify-center h-full">
    {#if isVideo}
      <button 
        class="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 z-10"
        on:click={onClose}
      >
        ×
      </button>
    {/if}
    {@html contentHtml}
  </div>
</dialog>

<style>
  dialog::backdrop {
    background: rgba(0, 0, 0, 0.75);
  }
  
  dialog[open] {
    animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  
  @keyframes zoom {
    from {
      transform: scale(0.95);
    }
    to {
      transform: scale(1);
    }
  }
</style> 