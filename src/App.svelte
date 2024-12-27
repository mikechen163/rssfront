<script>
  import { onMount } from 'svelte';
  
  let isMenuOpen = false;
  let feeds = [];
  let currentPage = 1;
  let totalPages = 0;
  let feedId = 28;

  async function fetchFeeds(page = 1) {
    try {
      const response = await fetch(`/api/update_selected_feed?feed_id=${feedId}&page=${page}`);
      const data = await response.json();
      if (data.success) {
        feeds = data.feeds[0].items;
        totalPages = data.pagination.total_pages;
        currentPage = data.pagination.current_page;
      }
    } catch (error) {
      console.error('Error fetching feeds:', error);
    }
  }

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  onMount(() => {
    fetchFeeds(1);
  });
</script>

<div class="flex min-h-screen bg-gray-100">
  <!-- 移动端菜单按钮 -->
  <button 
    class="fixed top-4 left-4 z-50 md:hidden bg-white p-2 rounded-lg shadow-lg"
    on:click={toggleMenu}
  >
    <i class="fas fa-bars text-xl"></i>
  </button>

  <!-- 侧边栏 -->
  <aside class={`fixed md:static w-64 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
    isMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
  }`}>
    <div class="p-4">
      <h2 class="text-xl font-bold mb-8">MENU</h2>
      <nav class="space-y-4">
        <a href="/" class="block hover:text-blue-600">Home</a>
        <a href="/trending" class="block hover:text-blue-600">Trending</a>
        <a href="/recommended" class="block hover:text-blue-600">Recommended</a>
        <a href="/latest" class="block hover:text-blue-600">Latest</a>
        
        <h3 class="font-bold mt-8 mb-4">分类目录</h3>
        <a href="/ai-tools" class="block hover:text-blue-600">AI 工具</a>
        <a href="/ai-power" class="block hover:text-blue-600">AI新势力</a>
        <a href="/xiaohu-ai" class="block hover:text-blue-600">XiaoHu.AI 学院</a>
        <a href="/ai-edu" class="block hover:text-blue-600">AI 教程</a>
        <a href="/ai-course" class="block hover:text-blue-600">AI 课程</a>
        <a href="/daily" class="block hover:text-blue-600">XiaoHu.AI日报</a>
        <a href="/examples" class="block hover:text-blue-600">开源项目案例库</a>
        <a href="/papers" class="block hover:text-blue-600">AI论文</a>
        <a href="/resources" class="block hover:text-blue-600">AI资源</a>
        <a href="/projects" class="block hover:text-blue-600">AI项目</a>
      </nav>

      <!-- 社交媒体链接 -->
      <div class="flex space-x-4 mt-8">
        <a href="#" class="text-gray-600 hover:text-blue-600">
          <i class="fab fa-facebook"></i>
        </a>
        <a href="#" class="text-gray-600 hover:text-blue-600">
          <i class="fab fa-twitter"></i>
        </a>
        <a href="#" class="text-gray-600 hover:text-blue-600">
          <i class="fab fa-instagram"></i>
        </a>
        <a href="#" class="text-gray-600 hover:text-blue-600">
          <i class="fab fa-youtube"></i>
        </a>
      </div>
    </div>
  </aside>

  <!-- 主要内容区域 -->
  <main class="flex-1 p-4 md:p-8">
    <h1 class="text-2xl font-bold mb-6">Latest</h1>
    
    <!-- 文章卡片网格 -->
    <div class="grid gap-6 md:grid-cols-2">
      {#each feeds as item}
        <article class="bg-white rounded-lg shadow-md overflow-hidden">
          <img 
            src={item.image_url} 
            alt={item.title}
            class="w-full h-48 object-cover"
            onerror="this.src='https://via.placeholder.com/400x225'"
          />
          <div class="p-4">
            <h2 class="text-xl font-bold mb-2">{item.title}</h2>
            <p class="text-gray-600 mb-4 line-clamp-2">{item.summary}</p>
            <div class="text-gray-600 text-sm flex justify-between items-center">
              <div class="flex items-center">
                <img 
                  src={`/api/${item.favicon}`} 
                  alt="source icon" 
                  class="w-4 h-4 mr-2"
                />
                <span>{item.rss_title}</span>
              </div>
              <span>{formatDate(item.time)}</span>
            </div>
          </div>
        </article>
      {/each}
    </div>

    <!-- 分页控件 -->
    <div class="mt-8 flex justify-center space-x-2">
      <button 
        class="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        disabled={currentPage === 1}
        on:click={() => fetchFeeds(currentPage - 1)}
      >
        上一页
      </button>
      <span class="px-4 py-2">第 {currentPage} 页，共 {totalPages} 页</span>
      <button 
        class="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        disabled={currentPage === totalPages}
        on:click={() => fetchFeeds(currentPage + 1)}
      >
        下一页
      </button>
    </div>
  </main>
</div>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
