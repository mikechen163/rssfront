<script>
  let isMenuOpen = false;

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }
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
    
    <!-- 文章卡片 -->
    <div class="grid gap-6 md:grid-cols-2">
      <article class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="h-48 bg-gray-200"></div>
        <div class="p-4">
          <h2 class="text-xl font-bold mb-2">Meta AI提出了一种新的语言模型架构"Large Language Model (LCM)"让模型更像人类思考</h2>
          <div class="text-gray-600 text-sm">
            <span>159 VIEWS</span>
            <span class="mx-2">•</span>
            <span>2024年12月25日</span>
          </div>
        </div>
      </article>
      
      <article class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="h-48 bg-gray-200"></div>
        <div class="p-4">
          <h2 class="text-xl font-bold mb-2">Anthropic 公布了一种全新的 AI 超越技术 可以让AI更像人类</h2>
          <div class="text-gray-600 text-sm">
            <span>230 VIEWS</span>
            <span class="mx-2">•</span>
            <span>2024年12月23日</span>
          </div>
        </div>
      </article>
    </div>
  </main>
</div>
