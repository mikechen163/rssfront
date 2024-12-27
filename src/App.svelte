<script>
  import { onMount } from 'svelte';
  import ArticleDetail from './components/ArticleDetail.svelte';
  import Resizer from './components/Resizer.svelte';
  
  let isMenuOpen = false;
  let feeds = [];
  let currentPage = 1;
  let totalPages = 0;
  let feedId = 28;
  let isLoading = true;
  let rssFeeds = [];
  let groupedFeeds = {};
  let expandedCategories = {};
  let selectedArticle = null;
  let isMobile = false;
  let isListView = true;
  let middleColumnWidth = 380; // 减小默认宽度
  
  // 检测是否为移动设备
  function checkMobile() {
    isMobile = window.innerWidth < 1024;
  }

  onMount(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    fetchRssFeeds();
    fetchFeeds(1);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  });

  // 获取 RSS 源列表并按类别分组
  async function fetchRssFeeds() {
    try {
      const response = await fetch('/api/get_user_rss/3');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      rssFeeds = data;
      
      // 按 rss_class 分组
      groupedFeeds = data.reduce((acc, feed) => {
        if (!acc[feed.rss_class]) {
          acc[feed.rss_class] = [];
        }
        acc[feed.rss_class].push(feed);
        return acc;
      }, {});

      console.log('Grouped feeds:', groupedFeeds); // 调试用
    } catch (error) {
      console.error('Error fetching RSS feeds:', error);
      groupedFeeds = {}; // 确保在错误时有一个空对象
    }
  }

  async function fetchFeeds(page = 1) {
    isLoading = true;
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
    } finally {
      isLoading = false;
    }
  }

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }

  function toggleCategory(category) {
    expandedCategories[category] = !expandedCategories[category];
    expandedCategories = expandedCategories; // 触发更新
  }

  function selectFeed(rssid) {
    feedId = rssid;
    fetchFeeds(1);
    if (window.innerWidth < 768) { // 在移动端自动关闭菜单
      isMenuOpen = false;
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

  async function fetchArticleContent(itemId, item) {
    try {
      const response = await fetch(`/api/get_content?itemid=${itemId}`);
      const data = await response.json();
      if (data.success) {
        selectedArticle = {
          ...data,
          image_url: item.image_url,
          title: item.title,
          time: item.time,
          rss_title: item.rss_title,
          favicon: item.favicon,
          itemid: item.itemid
        };
        // 点击文章时自动切换到列表视图
        isListView = true;
      }
    } catch (error) {
      console.error('Error fetching article content:', error);
    }
  }

  function toggleView() {
    isListView = !isListView;
    if (!isListView) {
      // 切换到网格视图时，关闭文章详情
      selectedArticle = null;
    }
  }

  function handleResize(newWidth) {
    middleColumnWidth = newWidth;
  }
</script>

<div class="flex min-h-screen bg-gray-100">
  <!-- 移动端菜单按钮 -->
  <button 
    class="fixed top-0 left-0 z-50 lg:hidden bg-white p-4"
    on:click={toggleMenu}
  >
    <i class="fas fa-bars text-xl"></i>
  </button>

  <!-- 侧边栏 -->
  <aside class={`fixed lg:static w-64 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out overflow-y-auto 
    ${isMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    ${selectedArticle && isListView ? 'lg:block' : 'lg:block'}`}
  >
    <div class="p-4">
      <h2 class="text-xl font-bold mb-8 md:block hidden">MENU</h2>
      <nav class="space-y-2">
        {#each Object.entries(groupedFeeds) as [category, feeds]}
          <div class="space-y-1">
            <button 
              class="w-full text-left px-2 py-1 hover:bg-gray-100 rounded flex justify-between items-center"
              on:click={() => toggleCategory(category)}
            >
              <span class="capitalize">{category}</span>
              <i class={`fas fa-chevron-${expandedCategories[category] ? 'down' : 'right'} text-xs`}></i>
            </button>
            
            {#if expandedCategories[category]}
              <div class="ml-4 space-y-1">
                {#each feeds as feed}
                  <button 
                    class="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded flex items-center {feedId === feed.rssid ? 'bg-blue-50 text-blue-600' : ''}"
                    on:click={() => selectFeed(feed.rssid)}
                  >
                    <img 
                      src={`/api/${feed.favicon}`} 
                      alt="" 
                      class="w-4 h-4 mr-2"
                    />
                    <span class="truncate">{feed.title}</span>
                  </button>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      </nav>
    </div>
  </aside>

  <!-- 主要内容区域 - 调整最小宽度 -->
  <main 
    class={`flex-1 mt-16 lg:mt-0 min-w-0 transition-[width] ${
      isListView ? 'p-4' : 'p-2 md:p-4'
    } ${
      selectedArticle && isListView ? 'middle-column' : ''
    }`}
    style={selectedArticle && isListView ? `width: ${middleColumnWidth}px` : ''}
  >
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">
        {#if feedId && rssFeeds.length}
          {rssFeeds.find(f => f.rssid === feedId)?.title || 'Latest'}
        {:else}
          Latest
        {/if}
      </h1>

      <!-- 视图切换按钮 -->
      <button 
        class="hidden lg:flex items-center space-x-2 px-3 py-2 rounded-lg bg-white shadow-sm hover:bg-gray-50"
        on:click={toggleView}
      >
        {#if isListView}
          <i class="fas fa-grid-2 mr-2"></i>
          <span>网格视图</span>
        {:else}
          <i class="fas fa-list mr-2"></i>
          <span>列表视图</span>
        {/if}
      </button>
    </div>
    
    {#if isLoading}
      <div class="flex justify-center items-center h-64">
        <div class="text-gray-600">加载中...</div>
      </div>
    {:else}
      <!-- 文章列表/网格 -->
      {#if selectedArticle && isListView}
        <!-- 列表视图 -->
        <div class="space-y-4">
          {#each feeds as item (item.itemid)}
            <article 
              class="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow {selectedArticle?.itemid === item.itemid ? 'ring-2 ring-blue-500' : ''}"
              on:click={() => fetchArticleContent(item.itemid, item)}
            >
              <div class="flex h-32">
                <img 
                  src={item.image_url} 
                  alt={item.title}
                  class="w-32 h-full object-cover"
                  onerror="this.src='https://via.placeholder.com/400x225'"
                />
                <div class="flex-1 p-4">
                  <h2 class="text-lg font-bold mb-2 line-clamp-2">{item.title}</h2>
                  <div class="text-gray-600 text-sm flex items-center mt-auto">
                    <img 
                      src={`/api/${item.favicon}`} 
                      alt="source icon" 
                      class="w-4 h-4 mr-2"
                    />
                    <span class="mr-4">{item.rss_title}</span>
                    <span>{formatDate(item.time)}</span>
                  </div>
                </div>
              </div>
            </article>
          {/each}
        </div>
      {:else}
        <!-- 网格视图 - 减少间距 -->
        <div class="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {#each feeds as item (item.itemid)}
            <article 
              class="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
              on:click={() => fetchArticleContent(item.itemid, item)}
            >
              <img 
                src={item.image_url} 
                alt={item.title}
                class="w-full h-48 object-cover"
                onerror="this.src='https://via.placeholder.com/400x225'"
              />
              <div class="p-4">
                <h2 class="text-lg font-bold mb-2 line-clamp-2 hover:line-clamp-none">{item.title}</h2>
                <p class="text-gray-600 mb-4 text-sm line-clamp-2 hover:line-clamp-none">{item.summary}</p>
                <div class="text-gray-600 text-sm flex justify-between items-center">
                  <div class="flex items-center">
                    <img 
                      src={`/api/${item.favicon}`} 
                      alt="source icon" 
                      class="w-4 h-4 mr-2"
                    />
                    <span class="truncate">{item.rss_title}</span>
                  </div>
                  <span class="text-xs">{formatDate(item.time)}</span>
                </div>
              </div>
            </article>
          {/each}
        </div>
      {/if}

      <!-- 分页控件 -->
      {#if totalPages > 0}
        <div class="mt-8 flex justify-center space-x-2">
          <button 
            class="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            disabled={currentPage === 1 || isLoading}
            on:click={() => fetchFeeds(currentPage - 1)}
          >
            上一页
          </button>
          <span class="px-4 py-2">第 {currentPage} 页，共 {totalPages} 页</span>
          <button 
            class="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            disabled={currentPage === totalPages || isLoading}
            on:click={() => fetchFeeds(currentPage + 1)}
          >
            下一页
          </button>
        </div>
      {/if}
    {/if}
  </main>

  <!-- 分隔线容器 - 增加宽度和视觉效果 -->
  {#if selectedArticle && isListView}
    <div class="hidden lg:flex items-center h-full w-2 hover:w-4 group transition-all">
      <Resizer onResize={handleResize} />
    </div>
  {/if}

  <!-- 文章详情面板 -->
  {#if selectedArticle && isListView}
    <div class="hidden lg:block flex-1 h-screen sticky top-0 bg-white shadow-lg overflow-y-auto min-w-[400px]">
      <ArticleDetail 
        content={selectedArticle} 
        onClose={() => selectedArticle = null}
        isDesktop={true}
      />
    </div>

    <!-- 移动端的模态框 -->
    {#if isMobile}
      <div class="lg:hidden">
        <ArticleDetail 
          content={selectedArticle} 
          onClose={() => selectedArticle = null}
          isDesktop={false}
        />
      </div>
    {/if}
  {/if}
</div>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  :global(.middle-column) {
    min-width: 280px;
    max-width: calc(100% - 700px);
  }
</style>
