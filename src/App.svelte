<script>
  import { onMount } from 'svelte';
  import { scale } from 'svelte/transition';
  import ArticleDetail from './components/ArticleDetail.svelte';
  import Resizer from './components/Resizer.svelte';
  import ImageDialog from './components/ImageDialog.svelte';
  import LoginDialog from './components/LoginDialog.svelte';
  import UserMenu from './components/UserMenu.svelte';
  
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
  let isListView = false;
  let middleColumnWidth = window.innerWidth < 768 ? window.innerWidth : 450; // 响应式默认宽度
  let isViewMenuOpen = false; // 控制下拉菜单的显示状态
  let viewMode = 'grid'; // 'grid', 'list', 'image', 'page'
  let selectedImageItem = null;
  let showLoginDialog = false; // 改为默认不显示
  let userId = null;
  let userName = '';
  
  // 判断是否使用中间栏布局
  $: useMiddleColumn = viewMode === 'list' && selectedArticle;
  
  // 检测是否为移动设备
  function checkMobile() {
    isMobile = window.innerWidth < 1024;
  }

  // 检查是否已登录
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  async function checkLoginStatus() {
    const cookieUserId = getCookie('userid');
    if (cookieUserId) {
      try {
        const response = await fetch(`/api/get_user_info?userid=${cookieUserId}`);
        const data = await response.json();
        if (data.success) {
          userId = data.userid;
          userName = data.name;
          showLoginDialog = false;
          await fetchRssFeeds(cookieUserId);
        } else {
          showLoginDialog = true;
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        showLoginDialog = true;
      }
    } else {
      showLoginDialog = true;
    }
  }

  function handleLogout() {
    // 清除 cookie
    document.cookie = 'userid=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT';
    userId = null;
    userName = '';
    showLoginDialog = true;
    // 清除其他相关状态
    feeds = [];
    rssFeeds = [];
    groupedFeeds = {};
  }

  onMount(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    checkLoginStatus();
    fetchFeeds(1);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  });

  // 获取 RSS 源列表并按类别分组
  async function fetchRssFeeds(userId) {
    try {
      const response = await fetch(`/api/get_user_rss/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      rssFeeds = data;
      
      // 按 rss_class 组
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

  async function toggleView() {
    isListView = !isListView;
    if (isListView && !selectedArticle && feeds.length > 0) {
      // 切换到列表视图时，如果没有选中的文章且列表不为空，则自动选中第一篇
      const firstItem = feeds[0];
      await fetchArticleContent(firstItem.itemid, firstItem);
    } else if (!isListView) {
      // 切换到网格视图时，清除选中状态
      selectedArticle = null;
    }
  }

  function handleResize(newWidth) {
    // 根据屏幕宽度调整限制
    const maxWidth = window.innerWidth < 768 ? window.innerWidth - 32 : 400; // 移动端预留边距
    middleColumnWidth = Math.max(260, Math.min(newWidth, maxWidth));
  }

  // 监听窗口大小变化
  onMount(() => {
    const handleWindowResize = () => {
      if (window.innerWidth < 768) {
        middleColumnWidth = window.innerWidth - 32; // 移动端自动调整宽度
      }
    };

    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  });

  // 关闭下拉菜单
  function closeViewMenu(event) {
    // 如果点击的是菜单按钮本身，不处理（让 toggleViewMenu 处理）
    if (event.target.closest('.view-mode-button')) return;
    isViewMenuOpen = false;
  }

  // 切换下拉菜单
  function toggleViewMenu() {
    isViewMenuOpen = !isViewMenuOpen;
  }

  // 选择视图模式
  async function selectViewMode(mode) {
    isViewMenuOpen = false;
    if (mode !== viewMode) {
      viewMode = mode;
      isListView = mode === 'list';
      if (isListView && !selectedArticle && feeds.length > 0) {
        // 切换到列表视图时，如果没有选中的文章且列表不为空，则自动选中第一篇
        const firstItem = feeds[0];
        await fetchArticleContent(firstItem.itemid, firstItem);
      } else if (!isListView) {
        // 切换到其他视图时，清除选中状态
        selectedArticle = null;
      }
    }
  }

  // 添加点击外部关闭菜单的事件监听
  onMount(() => {
    document.addEventListener('click', closeViewMenu);
    return () => {
      document.removeEventListener('click', closeViewMenu);
    };
  });

  function handleImageClick(event, item) {
    if (viewMode === 'image') {
      event.preventDefault();
      event.stopPropagation();
      selectedImageItem = item;
    }
  }

  async function fetchContent(itemId) {
    try {
      const response = await fetch(`/api/get_content?itemid=${itemId}`);
      const data = await response.json();
      if (data.success) {
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching content:', error);
      return null;
    }
  }

  // 修改文章点击处理函数
  async function handleItemClick(item) {
    if (viewMode !== 'list') {
      // 如果不是列表模式，先切换到列表模式
      await selectViewMode('list');
    }
    // 然后加载文章内容
    await fetchArticleContent(item.itemid, item);
  }

  // 修改登录成功处理函数
  function handleLoginSuccess(event) {
    userId = event.detail.userId;
    userName = event.detail.name;
    showLoginDialog = false;
    fetchRssFeeds(userId);
  }
</script>

<svelte:head>
  <!-- 添加过渡动画所需的 CSS -->
  <style>
    .menu-enter {
      transform: scale(0.95);
      opacity: 0;
    }
    .menu-enter-active {
      transform: scale(1);
      opacity: 1;
      transition: all 0.1s ease-out;
    }
    .menu-exit {
      transform: scale(1);
      opacity: 1;
    }
    .menu-exit-active {
      transform: scale(0.95);
      opacity: 0;
      transition: all 0.1s ease-in;
    }
  </style>
</svelte:head>

<div class="flex min-h-screen bg-gray-100">
  <!-- 移动端菜单钮 -->
  <button 
    class="fixed top-0 left-0 z-50 lg:hidden bg-white p-4"
    on:click={toggleMenu}
  >
    <i class="fas fa-bars text-xl"></i>
  </button>

  <!-- 侧边栏 - 调整宽度和显示逻辑 -->
  <aside class={`fixed lg:static lg:flex-shrink-0 w-64 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out overflow-y-auto 
    ${isMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    ${useMiddleColumn ? 'lg:w-64' : 'lg:w-72'}`}
  >
    <div class="flex flex-col h-full">
      <div class="flex-1">
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
      </div>
      
      {#if userName}
        <div class="p-4 mt-auto border-t">
          <UserMenu {userName} onLogout={handleLogout} />
        </div>
      {/if}
    </div>
  </aside>

  <!-- 主要内容区域 -->
  <main 
    class={`flex-1 mt-16 lg:mt-0 min-w-0 transition-all ${
      isListView ? 'p-4' : 'p-2 md:p-4'
    } ${
      useMiddleColumn ? 'middle-column' : ''
    }`}
    style={useMiddleColumn ? `width: ${middleColumnWidth}px` : ''}
  >
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-xl font-bold">
        {#if feedId && rssFeeds.length}
          {rssFeeds.find(f => f.rssid === feedId)?.title || 'Latest'}
        {:else}
          Latest
        {/if}
      </h1>

      <!-- 视图切换按钮 - 同时支持移动端和桌面端 -->
      <div class="relative">
        <button 
          class="view-mode-button flex items-center space-x-2 px-3 py-2 rounded-lg bg-white shadow-sm hover:bg-gray-50"
          on:click|stopPropagation={toggleViewMenu}
        >
          {#if viewMode === 'grid'}
            <i class="fas fa-grid-2"></i>
            <span class="hidden sm:inline ml-2">网格视图</span>
          {:else if viewMode === 'list'}
            <i class="fas fa-list"></i>
            <span class="hidden sm:inline ml-2">列表视图</span>
          {:else if viewMode === 'image'}
            <i class="fas fa-image"></i>
            <span class="hidden sm:inline ml-2">图片视图</span>
          {:else}
            <i class="fas fa-newspaper"></i>
            <span class="hidden sm:inline ml-2">页面视图</span>
          {/if}
          <i class="fas fa-chevron-down text-xs text-gray-500 ml-1 sm:ml-2"></i>
        </button>

        {#if isViewMenuOpen}
          <div 
            class="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg py-1 z-50 border"
            in:scale={{ duration: 100, start: 0.95 }}
            out:scale={{ duration: 100, start: 1 }}
          >
            <button
              class="w-full px-4 py-3 sm:py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
              class:text-blue-600={viewMode === 'grid'}
              on:click={() => selectViewMode('grid')}
            >
              <i class="fas fa-grid-2 w-5"></i>
              <span>网格视图</span>
              {#if viewMode === 'grid'}
                <i class="fas fa-check ml-auto"></i>
              {/if}
            </button>
            <button
              class="w-full px-4 py-3 sm:py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
              class:text-blue-600={viewMode === 'list'}
              on:click={() => selectViewMode('list')}
            >
              <i class="fas fa-list w-5"></i>
              <span>列表视图</span>
              {#if viewMode === 'list'}
                <i class="fas fa-check ml-auto"></i>
              {/if}
            </button>
            <button
              class="w-full px-4 py-3 sm:py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
              class:text-blue-600={viewMode === 'image'}
              on:click={() => selectViewMode('image')}
            >
              <i class="fas fa-image w-5"></i>
              <span>图片视图</span>
              {#if viewMode === 'image'}
                <i class="fas fa-check ml-auto"></i>
              {/if}
            </button>
            <button
              class="w-full px-4 py-3 sm:py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
              class:text-blue-600={viewMode === 'page'}
              on:click={() => selectViewMode('page')}
            >
              <i class="fas fa-newspaper w-5"></i>
              <span>页面视图</span>
              {#if viewMode === 'page'}
                <i class="fas fa-check ml-auto"></i>
              {/if}
            </button>
          </div>
        {/if}
      </div>
    </div>
    
    {#if isLoading}
      <div class="flex justify-center items-center h-64">
        <div class="text-gray-600">加载中...</div>
      </div>
    {:else}
      {#if viewMode === 'list'}
        <!-- 列表视图 -->
        <div class="space-y-3">
          {#each feeds as item (item.itemid)}
            <article 
              class="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow {selectedArticle?.itemid === item.itemid ? 'ring-2 ring-blue-500' : ''}"
              on:click={() => handleItemClick(item)}
            >
              <div class="flex h-24">
                <div class="flex-1 p-3 min-w-0">
                  <h2 class="text-base font-medium mb-1 line-clamp-2">{item.title}</h2>
                  <div class="text-gray-600 text-xs flex items-center mt-auto">
                    <img 
                      src={`/api/${item.favicon}`} 
                      alt="source icon" 
                      class="w-3 h-3 mr-1"
                    />
                    <span class="mr-2 truncate">{item.rss_title}</span>
                    <span class="flex-shrink-0">{formatDate(item.time)}</span>
                  </div>
                </div>
                <div class="w-24 flex-shrink-0">
                  <img 
                    src={item.image_url} 
                    alt={item.title}
                    class="w-full h-full object-cover"
                    onerror="this.src='https://via.placeholder.com/400x225'"
                  />
                </div>
              </div>
            </article>
          {/each}
        </div>
      {:else if viewMode === 'page'}
        <!-- 页面视图 -->
        <div class="max-w-4xl mx-auto space-y-12">
          {#each feeds as item (item.itemid)}
            <div class="bg-white rounded-lg shadow-lg overflow-hidden">
              <div class="p-6">
                <!-- 文章标题和元信息 -->
                <div class="mb-6">
                  <h1 class="text-2xl font-bold mb-4">{item.title}</h1>
                  <div class="flex items-center text-gray-600 text-sm">
                    <img 
                      src={`/api/${item.favicon}`} 
                      alt="source icon" 
                      class="w-4 h-4 mr-2"
                    />
                    <span class="mr-4">{item.rss_title}</span>
                    <span>{formatDate(item.time)}</span>
                  </div>
                </div>

                <!-- 封面图片 -->
                {#if item.image_url}
                  <div class="mb-6">
                    <img 
                      src={item.image_url} 
                      alt={item.title}
                      class="w-full h-auto rounded-lg"
                      onerror="this.src='https://via.placeholder.com/1200x600'"
                    />
                  </div>
                {/if}

                <!-- 文章内容 -->
                {#await fetchContent(item.itemid)}
                  <div class="animate-pulse">
                    <div class="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                {:then content}
                  {#if content}
                    <div class="prose max-w-none">
                      {@html content.description}
                    </div>
                  {/if}
                {:catch error}
                  <div class="text-red-500">
                    加载内容失败
                  </div>
                {/await}
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <!-- 网格视图或图片视图 -->
        <div class={`grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 ${viewMode === 'image' ? 'grid-flow-dense' : ''}`}>
          {#each feeds as item (item.itemid)}
            <article 
              class={`cursor-pointer transition-shadow ${
                viewMode === 'image' 
                  ? 'relative aspect-square overflow-hidden hover:opacity-90' 
                  : 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl'
              }`}
              on:click={viewMode === 'image' ? null : () => handleItemClick(item)}
            >
              <img 
                src={item.image_url} 
                alt={item.title}
                class={viewMode === 'image' 
                  ? 'absolute inset-0 w-full h-full object-cover'
                  : 'w-full aspect-video object-cover'
                }
                on:click={(e) => viewMode === 'image' ? handleImageClick(e, item) : null}
                onerror="this.src='https://via.placeholder.com/400x225'"
              />
              {#if viewMode === 'grid'}
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
              {/if}
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

  <!-- 分隔线 - 只在列表模式且有选中文章时显示 -->
  {#if useMiddleColumn}
    <div class="hidden lg:flex items-center h-full w-2 hover:w-4 group transition-all">
      <Resizer onResize={handleResize} />
    </div>
  {/if}

  <!-- 文章详情面板 - 只在列表模式且有选中文章时显示 -->
  {#if useMiddleColumn}
    <div class="hidden lg:block flex-1 h-screen sticky top-0 bg-white shadow-lg overflow-y-auto min-w-[400px]">
      <ArticleDetail 
        content={selectedArticle} 
        onClose={() => selectedArticle = null}
        isDesktop={true}
      />
    </div>
  {/if}

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

  <!-- 图片对话框 -->
  {#if selectedImageItem}
    <ImageDialog 
      item={selectedImageItem} 
      onClose={() => selectedImageItem = null} 
    />
  {/if}

  {#if showLoginDialog}
    <LoginDialog
      on:loginSuccess={handleLoginSuccess}
      on:close={() => showLoginDialog = false}
    />
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
    min-width: 260px !important;
    max-width: 400px;
    flex-shrink: 0;
  }

  /* 移动端样式 */
  @media (max-width: 768px) {
    :global(.middle-column) {
      min-width: auto !important;
      max-width: 100% !important;
      width: 100% !important;
    }
  }
</style>
