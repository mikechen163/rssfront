<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
  {#each articles as article}
    <div class="article-card {article.image_url ? 'has-image' : ''}">
      {#if article.image_url}
        <img 
          src={article.image_url} 
          alt={article.title}
          class="article-image"
          on:error={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/300x200';
          }}
        />
      {/if}
      <div class="article-content">
        <h3 class="article-title">{article.title}</h3>
        <p class="article-description">{article.description}</p>
      </div>
    </div>
  {/each}
</div> 