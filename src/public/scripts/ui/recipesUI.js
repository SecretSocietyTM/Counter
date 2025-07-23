const COLORS = {
    1: "--clr-primary-blue",
    2: "--clr-primary-green",
    3: "--clr-primary-red",
    4: "--clr-accent-yellow",
    5: "--clr-accent-lightblue",
    6: "--clr-accent-purple",
    7: "--clr-accent-orange"
}

const EMOJIS = {
    1: "../assets/recipes/meat.svg",
    2: "../assets/recipes/bowl.svg"
}


export function createCategory(category) {
    const main_container = document.createElement("div");
    main_container.className = "category shadow";
    main_container.dataset.id = category.category_id;
    main_container.style.outline = `2px solid var(${COLORS[category.color]})` 

    const header = document.createElement("div");
    header.className = "category__header";

    const header_title = document.createElement("div");
    header_title.className = "header__title";

    const icon_div = document.createElement("div");
    icon_div.className = "flex gap-1_0 ai-cntr";

    const buttons_div = document.createElement("div");
    buttons_div.className = "flex gap-1_25 ai-cntr";

    const emoji = document.createElement("img");
    emoji.src = EMOJIS[category.emoji];

    const name = document.createElement("p");
    name.className = "fs-24 fw-b";
    name.textContent = category.name;

    const kebab_button = document.createElement("button");
    kebab_button.className = "icon_button";
    kebab_button.type = "button";

    const add_button = document.createElement("button");
    add_button.className = "icon_button";
    add_button.type = "button";

    const kebab_image = document.createElement("img");
    kebab_image.src = "../assets/shared/icons/x-kebab.svg";
    kebab_button.appendChild(kebab_image);

    const add_svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    add_svg.setAttribute("width", "24");
    add_svg.setAttribute("height", "24");
    add_svg.setAttribute("viewBox", "0 0 24 24");
    add_svg.style.color = `var(${COLORS[category.color]})`
    add_button.appendChild(add_svg);

    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "../assets/icons.svg#plus");
    add_svg.appendChild(use);
/*     add_svg.innerHTML = `        
        <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`; */

    const blurb = document.createElement("p");
    blurb.className = "fs-14 txt-ntrl-60";
    blurb.textContent = category.blurb;

    const list = document.createElement("ul");
    list.className = "recipeslist";

    main_container.appendChild(header);
    header.appendChild(header_title);
    header_title.append(icon_div, buttons_div);
    icon_div.append(emoji, name);
    buttons_div.append(kebab_button, add_button);
    header.appendChild(blurb);
    main_container.appendChild(list)
    return main_container;
}


// TODO: almost finished #39, need to figure out svg shit...