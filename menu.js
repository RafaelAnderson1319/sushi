(() => {
  const menu = window.KANPAI_MENU || [];
  const tabs = document.querySelector('#catalog-tabs');
  const select = document.querySelector('#catalog-select');
  const search = document.querySelector('#catalog-search');
  const list = document.querySelector('#catalog-items');
  const title = document.querySelector('#catalog-category');
  const count = document.querySelector('#catalog-count');
  const empty = document.querySelector('#catalog-empty');
  if (!menu.length || !tabs || !list) return;

  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const categoryLabels = { Hots: 'Sushis quentes', Kids: 'Infantil', Drinks: 'Drinques' };
  const displayCategory = name => categoryLabels[name] || name;
  let current = menu[0].name;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function card(item, category) {
    const article = element('article', 'catalog-item');
    const media = element('div', 'catalog-item-media');
    const image = element('img');
    image.src = item.image;
    image.alt = `Foto ilustrativa da categoria ${displayCategory(category)}`;
    image.loading = 'lazy';
    image.decoding = 'async';
    media.append(image);
    const body = element('div', 'catalog-item-body');
    const label = element('span', 'catalog-item-category', displayCategory(category));
    const name = element('h4', '', item.name);
    const description = element('p', 'catalog-item-description', item.description);
    body.append(label, name, description);
    if (item.description.length > 240) {
      description.classList.add('clamped');
      const more = element('button', 'catalog-more', 'Ler descrição completa');
      more.type = 'button';
      more.setAttribute('aria-expanded', 'false');
      more.addEventListener('click', () => {
        const expanded = more.getAttribute('aria-expanded') !== 'true';
        more.setAttribute('aria-expanded', String(expanded));
        description.classList.toggle('clamped', !expanded);
        more.textContent = expanded ? 'Mostrar menos' : 'Ler descrição completa';
      });
      body.append(more);
    }
    const footer = element('div', 'catalog-item-footer');
    const price = element('strong', 'catalog-price', item.price);
    footer.append(price);
    body.append(footer);
    if (item.options.length) {
      body.append(element('p', 'catalog-options', `Outras porções: ${item.options.join(' · ')}`));
    }
    article.append(media, body);
    return article;
  }

  function render() {
    const query = normalize(search.value.trim());
    const categories = query ? menu : menu.filter(category => category.name === current);
    const results = categories.flatMap(category => category.items.filter(item => !query || normalize(`${item.name} ${item.description} ${category.name} ${displayCategory(category.name)}`).includes(query)).map(item => ({ item, category: category.name })));
    title.textContent = query ? `Resultados para “${search.value.trim()}”` : displayCategory(current);
    count.textContent = `${results.length} ${results.length === 1 ? 'item' : 'itens'}`;
    list.replaceChildren(...results.map(({ item, category }) => card(item, category)));
    empty.hidden = results.length > 0;
    tabs.querySelectorAll('[role="tab"]').forEach(button => {
      const selected = !query && button.dataset.category === current;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
  }

  menu.forEach((category, index) => {
    const tab = element('button', '', displayCategory(category.name));
    tab.type = 'button';
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', String(index === 0));
    tab.setAttribute('aria-controls', 'catalog-items');
    tab.tabIndex = index === 0 ? 0 : -1;
    tab.dataset.category = category.name;
    tab.addEventListener('click', () => { current = category.name; search.value = ''; select.value = current; render(); });
    tab.addEventListener('keydown', event => {
      const all = [...tabs.children];
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % all.length;
      else if (event.key === 'ArrowLeft') next = (index - 1 + all.length) % all.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = all.length - 1;
      else return;
      event.preventDefault();
      all[next].focus();
      all[next].click();
    });
    tabs.append(tab);
    const option = element('option', '', displayCategory(category.name));
    option.value = category.name;
    select.append(option);
  });
  select.addEventListener('change', () => { current = select.value; search.value = ''; render(); });
  search.addEventListener('input', render);
  document.querySelectorAll('[data-menu-category]').forEach(link => {
    link.addEventListener('click', () => {
      const category = link.dataset.menuCategory;
      if (!menu.some(entry => entry.name === category)) return;
      current = category;
      select.value = category;
      search.value = '';
      render();
    });
  });
  render();
})();
