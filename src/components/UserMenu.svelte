<script>
  import { scale } from 'svelte/transition';
  export let userName = '';
  export let onLogout;
  export let onWhatsNew;
  let showMenu = false;
  let showAboutDialog = false;

  function toggleMenu() {
    showMenu = !showMenu;
  }

  function handleClickOutside(event) {
    if (!event.target.closest('.user-menu') && !event.target.closest('.about-dialog')) {
      showMenu = false;
      showAboutDialog = false;
    }
  }

  // Get user initial in uppercase
  $: userInitial = userName ? userName[0].toUpperCase() : '';

  function handleLogout() {
    showMenu = false;
    onLogout();
  }

  function handleWhatsNew() {
    showMenu = false;
    onWhatsNew();
  }

  function handleAboutClick() {
    showMenu = false;
    window.open('/about.html', '_blank');
  }
</script>

<svelte:window on:click={handleClickOutside} />

<div class="user-menu relative">
  <button
    class="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded-lg w-full"
    on:click={toggleMenu}
  >
    <div class="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
      {userInitial}
    </div>
    <span class="flex-1 text-left truncate">{userName}</span>
    <i class="fas fa-chevron-up text-xs {showMenu ? 'rotate-180' : ''} transition-transform"></i>
  </button>

  {#if showMenu}
    <div
      class="absolute bottom-full left-0 w-full mb-2 bg-white rounded-lg shadow-lg py-1 border"
      in:scale={{ duration: 100, start: 0.95 }}
      out:scale={{ duration: 100, start: 1 }}
    >
      <button
        class="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
        on:click={handleAboutClick}
      >
        <i class="fas fa-info-circle w-4"></i>
        <span>About</span>
      </button>

      <button
        class="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
        on:click={handleWhatsNew}
      >
        <i class="fas fa-bell w-5"></i>
        <span>Latest News</span>
      </button>

      <button
        class="w-full px-4 py-2 text-left hover:bg-gray-100 text-red-600 flex items-center space-x-2"
        on:click={handleLogout}
      >
        <i class="fas fa-sign-out-alt w-4"></i>
        <span>Logout</span>
      </button>
    </div>
  {/if}
</div> 