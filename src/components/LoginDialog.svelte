<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  let email = '';
  let password = '';
  let isLoading = false;
  let errorMessage = '';

  // 设置 cookie 的函数
  function setUserCookie(userId) {
    document.cookie = `userid=${userId};path=/;max-age=2592000`; // 30天过期
  }

  async function handleSubmit() {
    isLoading = true;
    errorMessage = '';
    
    try {
      const params = new URLSearchParams({
        email,
        password,
        json: 'true'
      });
      const response = await fetch(`/api/login?${params}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        // 设置 cookie
        setUserCookie(data.userid);
        
        // 登录成功,更新RSS订阅
        const rssResponse = await fetch(`/api/get_user_rss/${data.userid}`);
        if (rssResponse.ok) {
          dispatch('loginSuccess', {
            userId: data.userid,
            name: data.name // 确保传递用户名
          });
        } else {
          throw new Error('获取RSS数据失败');
        }
      } else {
        errorMessage = '登录失败,请检查邮箱和密码';
      }
    } catch (error) {
      console.error('登录错误:', error);
      errorMessage = '登录过程中发生错误,请重试';
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div class="bg-white rounded-lg p-6 w-full max-w-md">
    <h2 class="text-xl font-bold mb-4">用户登录</h2>
    
    <form on:submit|preventDefault={handleSubmit} class="space-y-4">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
          邮箱
        </label>
        <input
          type="email"
          id="email"
          bind:value={email}
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="请输入邮箱"
        />
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
          密码
        </label>
        <input
          type="password"
          id="password"
          bind:value={password}
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="请输入密码"
        />
      </div>

      {#if errorMessage}
        <p class="text-red-500 text-sm">{errorMessage}</p>
      {/if}

      <div class="flex justify-end space-x-3">
        <button
          type="button"
          class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
          on:click={() => dispatch('close')}
        >
          取消
        </button>
        <button
          type="submit"
          class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
          disabled={isLoading}
        >
          {isLoading ? '登录中...' : '登录'}
        </button>
      </div>
    </form>
  </div>
</div> 