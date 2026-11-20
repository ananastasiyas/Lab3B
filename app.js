const loadButton = document.querySelector('#load-users');
const searchInput = document.querySelector('#user-search');
const usersContainer = document.querySelector('#users');
const postsContainer = document.querySelector('#posts');
const usersMessage = document.querySelector('#users-message');
const postsMessage = document.querySelector('#posts-message');
const postsUser = document.querySelector('#posts-user');

let users = [];
let usersLoaded = false;
let postsLoading = false;

function showMessage(element, text, type = '') {
  element.textContent = text;
  element.className = `message ${type}`.trim();
}

function setPostButtonsDisabled(disabled) {
  usersContainer.querySelectorAll('.post-button').forEach(button => {
    button.disabled = disabled;
  });
}

function createUserCard(user) {
  const article = document.createElement('article');
  article.className = 'user-card';

  const info = document.createElement('div');
  const heading = document.createElement('h3');
  heading.textContent = user.name;

  const email = document.createElement('p');
  email.textContent = `Email: ${user.email}`;

  const city = document.createElement('p');
  city.textContent = `Город: ${user.address.city}`;

  info.append(heading, email, city);

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'post-button';
  button.textContent = 'Показать публикации';
  button.disabled = postsLoading;
  button.addEventListener('click', () => loadPosts(user));

  article.append(info, button);
  return article;
}

function renderUsers() {
  usersContainer.replaceChildren();

  if (!usersLoaded) return;

  const query = searchInput.value.trim().toLowerCase();
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(query)
  );

  if (filteredUsers.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'empty-message';
    emptyMessage.textContent = 'Пользователи не найдены';
    usersContainer.append(emptyMessage);
    return;
  }

  filteredUsers.forEach(user => usersContainer.append(createUserCard(user)));
}

function addPost(post) {
  const article = document.createElement('article');
  const heading = document.createElement('h3');
  heading.textContent = post.title;

  const text = document.createElement('p');
  text.textContent = post.body;

  article.append(heading, text);
  postsContainer.append(article);
}

loadButton.addEventListener('click', async () => {
  loadButton.disabled = true;
  showMessage(usersMessage, 'Загрузка...');

  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    users = await response.json();
    usersLoaded = true;
    renderUsers();
    showMessage(usersMessage, `Загружено пользователей: ${users.length}.`, 'success');
  } catch (error) {
    showMessage(usersMessage, `Не удалось загрузить пользователей: ${error.message}. Попробуйте ещё раз.`, 'error');
  } finally {
    loadButton.disabled = false;
  }
});

searchInput.addEventListener('input', renderUsers);

async function loadPosts(user) {
  if (postsLoading) return;

  postsLoading = true;
  setPostButtonsDisabled(true);
  postsUser.textContent = `Публикации пользователя: ${user.name}`;
  postsContainer.replaceChildren();
  showMessage(postsMessage, 'Загрузка...');

  try {
    const response = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${user.id}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const posts = await response.json();
    posts.slice(0, 3).forEach(addPost);
    showMessage(postsMessage, `Показано публикаций: ${Math.min(posts.length, 3)}.`, 'success');
  } catch (error) {
    showMessage(postsMessage, `Не удалось загрузить публикации: ${error.message}. Попробуйте ещё раз.`, 'error');
  } finally {
    postsLoading = false;
    setPostButtonsDisabled(false);
  }
}
