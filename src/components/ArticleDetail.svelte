<script>
  export let content = null;
  export let onClose = () => {};
  export let isDesktop = false;

  function handleKeydown(event) {
    if (event.key === 'Escape' && !isDesktop) {
      onClose();
    }
  }

  function formatDate(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  }
</script>

<svelte:window on:keydown={handleKeydown}/>

{#if content}
  <div class={isDesktop ? '' : 'fixed inset-0 bg-white z-50'}>
    <div class="flex flex-col h-full">
      <!-- 顶部导航栏 -->
      <div class="h-16 border-b flex items-center px-4 justify-between bg-white sticky top-0 z-10">
        {#if !isDesktop}
          <button 
            class="text-gray-600 hover:text-gray-900"
            on:click={onClose}
          >
            <i class="fas fa-arrow-left text-xl"></i>
          </button>
        {/if}
        
        <div class="flex items-center space-x-4 {isDesktop ? 'ml-auto' : ''}">
          <button class="text-gray-600 hover:text-gray-900">
            <i class="fas fa-share text-xl"></i>
          </button>
          <button class="text-gray-600 hover:text-gray-900">
            <i class="fas fa-ellipsis-v text-xl"></i>
          </button>
        </div>
      </div>

      <!-- 文章内容 -->
      <div class="flex-1 overflow-y-auto">
        <div class="max-w-3xl mx-auto px-4 py-8">
          <!-- 文章标题和元信息 -->
          <div class="mb-4">
            <h1 class="text-2xl font-bold mb-4">{content.title}</h1>
            <div class="flex items-center text-gray-600 text-sm mb-6">
              <img 
                src={`/api/${content.favicon}`} 
                alt="source icon" 
                class="w-4 h-4 mr-2"
              />
              <span class="mr-4">{content.rss_title}</span>
              <span>{formatDate(content.time)}</span>
            </div>
          </div>

          <!-- 封面图片 -->
          <div class="w-full mb-6">
            <img 
              src={content.image_url} 
              alt={content.title}
              class="w-full h-auto rounded-lg"
              onerror="this.src='https://via.placeholder.com/1200x600'"
            />
          </div>

          <!-- 文章内容 -->
          {@html content.description}
        </div>
      </div>

      <!-- 底部工具栏 -->
      <div class="h-16 border-t flex items-center justify-around bg-white sticky bottom-0">
        <button 
          class={`flex items-center space-x-2 px-4 py-2 rounded-full ${
            content.interaction.liked ? 'text-red-500' : 'text-gray-600'
          }`}
        >
          <i class="fas fa-heart"></i>
          <span>喜欢</span>
        </button>
        
        <button 
          class={`flex items-center space-x-2 px-4 py-2 rounded-full ${
            content.interaction.bookmarked ? 'text-blue-500' : 'text-gray-600'
          }`}
        >
          <i class="fas fa-bookmark"></i>
          <span>收藏</span>
        </button>
        
        <button class="flex items-center space-x-2 px-4 py-2 rounded-full text-gray-600">
          <i class="fas fa-comment"></i>
          <span>评论</span>
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  :global(.rss-item) {
    @apply text-gray-800 leading-relaxed;
  }
  
  :global(.rss-item p) {
    @apply mb-4 text-base leading-7;
  }
  
  :global(.rss-item ul) {
    @apply list-disc pl-5 mb-4 text-gray-600;
  }
  
  :global(.rss-item a) {
    @apply text-blue-600 hover:underline;
  }

  :global(.content) {
    @apply mt-4;
  }

  :global(.summary) {
    @apply text-lg font-medium text-gray-600 mb-6 border-l-4 border-blue-500 pl-4;
  }
</style> 