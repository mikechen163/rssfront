<script>
  export let content = null;
  export let onClose = () => {};
  export let isDesktop = false;
  export let onNext = () => {};
  export let onPrev = () => {};

  let touchStartX = 0;
  let touchEndX = 0;
  const SWIPE_THRESHOLD = 50;

  function handleTouchStart(event) {
    touchStartX = event.touches[0].clientX;
  }

  function handleTouchMove(event) {
    touchEndX = event.touches[0].clientX;
  }

  function handleTouchEnd() {
    const swipeDistance = touchEndX - touchStartX;
    
    if (!isDesktop) {
      if (Math.abs(swipeDistance) > SWIPE_THRESHOLD) {
        if (swipeDistance > 0) {
          onPrev();
        } else {
          onNext();
        }
      }
    }
    
    touchStartX = 0;
    touchEndX = 0;
  }

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
  <div 
    class={isDesktop ? '' : 'fixed inset-0 bg-white z-50 w-full'}
    on:touchstart={handleTouchStart}
    on:touchmove={handleTouchMove}
    on:touchend={handleTouchEnd}
  >
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
        <div class="max-w-full md:max-w-3xl mx-auto px-4 py-8">
          <!-- 文章标题和元信息 -->
          <div class="p-4 border-b">
            <div class="flex flex-col space-y-2">
              <!-- RSS源信息 -->
              <div class="flex items-center text-gray-600 text-sm">
                <img 
                  src={`/api/${content.favicon}`} 
                  alt="" 
                  class="w-4 h-4 mr-2"
                />
                <span>{content.rss_title}</span>
              </div>
              
              <!-- 文章标题 -->
              <h1 class="text-xl font-bold">
                <a 
                  href={content.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="hover:text-blue-600 hover:underline"
                >
                  {content.title}
                </a>
              </h1>
              
              <!-- 日期 -->
              <div class="text-gray-600 text-sm">
                {content.time}
              </div>
            </div>
          </div>

          <!-- 封面图片 -->
          {#if content.image_url}
            <div class="w-full mb-6">
              <img 
                src={content.image_url} 
                alt={content.title}
                class="w-full h-auto rounded-lg"
                onerror="this.src='https://via.placeholder.com/1200x600'"
              />
            </div>
          {/if}

          <!-- 文章内容 - 移除了重复的标题部分 -->
          <div 
            class="article-content {content?.description?.match(/[\u4e00-\u9fa5]/) ? 'chinese' : ''}"
          >
            {@html content.description.replace(/<h1[^>]*>.*?<\/h1>/g, '')}
          </div>
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

  :global(.article-content) {
    font-family: Verdana, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    line-height: 1.8;
    letter-spacing: 0.5px;
  }

  :global(.article-content p) {
    margin-bottom: 1.2em;
  }

  :global(.article-content.chinese) {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Microsoft YaHei", "微软雅黑", sans-serif;
    line-height: 2;
    letter-spacing: 1px;
  }
</style> 