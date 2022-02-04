let searchForm = document.querySelector('#search');
let content = document.querySelector('.content');
let error = document.querySelector('.error');

function generateNewsHTML(title, date, link, img){
    return `<div class="news-card">
                <img class="news-image" src="${img ? img : '/static/assets/NotAvailable.jpg'}" alt="">
                <div class="news-right">
                    <h3 class="news-title">${title ? title : 'N/A'}</h3>
                    <p class="news-date">${date ? date : 'N/A'}</p>
                    <a href="${link ? link : '#'}" class="news-link" target="_blank">See Original Post ></a>
                </div>
            </div>`
}

function generateChangeHTML(value){
    return `${value}<img id="change-arrow" src="${value >= 0 ? '/static/assets/GreenArrowUp.png' : '/static/assets/RedArrowDown.png'}">`
}

function generateChangePctHTML(value){
    return `${value}<img id="change-pct-arrow" src="${value >= 0 ? '/static/assets/GreenArrowUp.png' : '/static/assets/RedArrowDown.png'}">`
}

let tabs = {
    profile: document.querySelector('#company-tab'),
    summary: document.querySelector('#summary-tab'),
    charts: document.querySelector('#chart-tab'),
    news: document.querySelector('#news-tab')
};

let components = {
    profile: document.querySelector('#company'),
    summary: document.querySelector('#summary'),
    charts: document.querySelector('#chart'),
    news: document.querySelector('#news')
}; 

let populate = {
    profile: function(data){
        document.querySelector('#company #name').innerHTML = data.name ? data.name : 'N/A';
        document.querySelector('#company #company-symbol').innerHTML = data.symbol ? data.symbol : 'N/A';
        document.querySelector('#company #code').innerHTML = data.code ? data.code : 'N/A';
        document.querySelector('#company #ipo').innerHTML = data.ipo ? data.ipo : 'N/A';
        document.querySelector('#company #category').innerHTML = data.category ? data.category : 'N/A';
        document.querySelector('#company #company-logo').setAttribute('src', data.logo ? data.logo : '/static/assets/NotAvailable.jpg');
    },
    summary: function(data, ticker){
        document.querySelector('#summary #day').innerHTML = data.summary.t ? data.summary.t : 'N/A';
        document.querySelector('#summary #summary-symbol').innerHTML = ticker;
        document.querySelector('#summary #close').innerHTML = data.summary.pc ? data.summary.pc : 'N/A';
        document.querySelector('#summary #open').innerHTML = data.summary.o ? data.summary.o : 'N/A';
        document.querySelector('#summary #low').innerHTML = data.summary.l ? data.summary.l : 'N/A';
        document.querySelector('#summary #high').innerHTML = data.summary.h ? data.summary.h : 'N/A';
        document.querySelector('#summary #change').innerHTML = generateChangeHTML(data.summary.d ? data.summary.d : 0);
        document.querySelector('#summary #change-pct').innerHTML = generateChangePctHTML(data.summary.dp ? data.summary.dp : 0);

        if(data.recommendations){
            document.querySelector('#summary #ss').innerHTML = data.recommendations.strongSell ? data.recommendations.strongSell : '-';
            document.querySelector('#summary #s').innerHTML = data.recommendations.sell ? data.recommendations.sell : '-';
            document.querySelector('#summary #h').innerHTML = data.recommendations.hold ? data.recommendations.hold : '-';
            document.querySelector('#summary #b').innerHTML = data.recommendations.buy ? data.recommendations.buy : '-';
            document.querySelector('#summary #sb').innerHTML = data.recommendations.strongBuy ? data.recommendations.strongBuy : '-';
        }else {
            document.querySelector('#summary #ss').innerHTML = '-'
            document.querySelector('#summary #s').innerHTML = '-'
            document.querySelector('#summary #h').innerHTML = '-'
            document.querySelector('#summary #b').innerHTML = '-'
            document.querySelector('#summary #sb').innerHTML = '-'
        }
                
    },
    charts: function(data){

    },
    news: function(data){
        components.news.innerHTML = '';
        data.forEach(({headline, datetime, image, url}) => {
            components.news.innerHTML += generateNewsHTML(headline, datetime, url, image);
        });
    }
}

function activate(tab){
    for(let component in components){
        hide(components[component]);
    }
    for(let tab in tabs){
        tabs[tab].classList.remove('active');
    }
    switch(tab.getAttribute('id')){
        case 'company-tab':
            tab.classList.add('active');
            show(components.profile);
            break;
        case 'summary-tab':
            tab.classList.add('active');
            show(components.summary);
            break;
        case 'chart-tab':
            tab.classList.add('active');
            show(components.charts);
            break;
        case 'news-tab':
            tab.classList.add('active');
            show(components.news);
            break;
    }
}

function hide(component){
    if(!component.classList.contains('hide')){
        component.classList.add('hide');
    }
}

function show(component){
    if(component.classList.contains('hide')){
        component.classList.remove('hide');
    }
}

searchForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    let ticker = document.querySelector('#ticker').value;
    let API_BASE = '/api/v1';

    let PROFILE_URL = `${API_BASE}/${ticker}`;
    let SUMMARY_URL = `${PROFILE_URL}/summary`;
    let CHARTS_URL = `${PROFILE_URL}/chart`;
    let NEWS_URL = `${PROFILE_URL}/news`;

    let response = await fetch(PROFILE_URL);
    if(response.status == 404){
        hide(content);
        show(error);
    }else{
        hide(error);
        hide(content);
        let profile = await response.json();
        populate.profile(profile);
        activate(tabs.profile);
        show(content);
        let summary = await fetch(SUMMARY_URL).then((res, err) => res.json());
        populate.summary(summary, profile.symbol);
        let charts = await fetch(CHARTS_URL).then((res, err) => res.json());
        let news = await fetch(NEWS_URL).then((res, err) => res.json());
        populate.news(news)
    }
});

for(let tab in tabs){
    tabs[tab].addEventListener('click', (e) => {
        activate(tabs[tab])
    });
}

document.querySelector('#search button[type="reset"]').addEventListener('click', (e) => {
    hide(content);
    hide(error);
})