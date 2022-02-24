let searchForm = document.querySelector('#search');
let content = document.querySelector('.content');
let error = document.querySelector('.error');

function generateDateString(date, mode){
    return dayjs(date * 1000).format(mode);
}

function generateNewsHTML(title, date, link, img){
    return `<div class="news-card">
                <img class="news-image" src="${img ? img : '/static/assets/NotAvailable.jpg'}" alt="">
                <div class="news-right">
                    <h3 class="news-title">${title ? title : 'N/A'}</h3>
                    <p class="news-date">${date ? date : 'N/A'}</p>
                    <a href="${link ? link : '#'}" class="news-link" target="_blank">See Original Post</a>
                </div>
            </div>`;
}

function generateChangeHTML(value){
    return value != 0 ? `${value}<img id="change-arrow" src="${value > 0 ? '/static/assets/GreenArrowUp.png' : '/static/assets/RedArrowDown.png'}">` : `${value}`;
}

function generateChangePctHTML(value){
    return value != 0 ? `${value}<img id="change-pct-arrow" src="${value >= 0 ? '/static/assets/GreenArrowUp.png' : '/static/assets/RedArrowDown.png'}">` : `${value}`;
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
        components.profile.innerHTML = `
            <img class="logo" id="company-logo" src="${data.logo ? data.logo : '/static/assets/NotAvailable.jpg'}" alt="Company Logo">
            <hr class="separator">
            <p class="info"><span class="title">Company Name</span><span id="name">${data.name ? data.name : 'N/A'}</span></p>
            <hr class="separator">
            <p class="info"><span class="title">Stock Ticker Symbol</span><span id="company-symbol">${data.symbol ? data.symbol : 'N/A'}</span></p>
            <hr class="separator">
            <p class="info"><span class="title">Stock Exchange Code</span><span id="code">${data.code ? data.code : 'N/A'}</span></p>
            <hr class="separator">
            <p class="info"><span class="title">Company IPO Date</span><span id="ipo">${data.ipo ? data.ipo : 'N/A'}</span></p>
            <hr class="separator">
            <p class="info"><span class="title">Category</span><span id="category">${data.category ? data.category : 'N/A'}</span></p>
            <hr class="separator">    
        `;
    },
    summary: function(data, ticker){
        components.summary.innerHTML = `
            <hr class="separator">
            <p class="info"><span class="title">Stock Ticker Symbol</span><span id="summary-symbol">${ticker}</span></p>
            <hr class="separator">
            <p class="info"><span class="title">Trading Day</span><span id="day">${data.summary.t ? generateDateString(data.summary.t, 'D MMMM, YYYY') : 'N/A'}</span></p>
            <hr class="separator">
            <p class="info"><span class="title">Previous Closing Price</span><span id="close">${data.summary.pc ? data.summary.pc : 'N/A'}</span></p>
            <hr class="separator">
            <p class="info"><span class="title">Opening Price</span><span id="open">${data.summary.o ? data.summary.o : 'N/A'}</span></p>
            <hr class="separator">
            <p class="info"><span class="title">High Price</span><span id="high">${data.summary.h ? data.summary.h : 'N/A'}</span></p>
            <hr class="separator">
            <p class="info"><span class="title">Low Price</span><span id="low">${data.summary.l ? data.summary.l : 'N/A'}</span></p>
            <hr class="separator">
            <p class="info"><span class="title">Change</span><span id="change">${generateChangeHTML(data.summary.d ? data.summary.d : 0)}</span></p>
            <hr class="separator">
            <p class="info"><span class="title">Change Percent</span><span id="change-pct">${generateChangePctHTML(data.summary.dp ? data.summary.dp : 0)}</span></p>
            <hr class="separator">
            <div class="recommendations">
                <div class="left">Strong<br>Sell</div>
                <div class="container">
                    ${data.recommendations ? 
                        `<div class="box" id="ss">${data.recommendations.strongSell}</div>
                        <div class="box" id="s">${data.recommendations.sell}</div>
                        <div class="box" id="h">${data.recommendations.hold}</div>
                        <div class="box" id="b">${data.recommendations.buy}</div>
                        <div class="box" id="sb">${data.recommendations.strongBuy}</div>` : 
                        `<div class="box" id="ss">-</div>
                        <div class="box" id="s">-</div>
                        <div class="box" id="h">-</div>
                        <div class="box" id="b">-</div>
                        <div class="box" id="sb">-</div>`
                    }
                </div>
                <div class="right">Strong<br>Buy</div>
            </div>
            <p class="extra">Recommendation Trends</p>
        `;
    },
    charts: function(data, ticker){
        chart = [];
        volume = [];
        for(let i=0; i < data.t.length; i++){
            chart.push([data.t[i] * 1000, data.c[i]]);
            volume.push([data.t[i] * 1000, data.v[i]])
        }
        Highcharts.stockChart('chart', {
            title: {
                text: `Stock Price ${ticker} ${generateDateString(Date.now() / 1000, 'YYYY-MM-DD')}`
            },
            subtitle: {
                text: '<a href="https://finnhub.io/" target="_blank">Source: Finnhub</a>',
                useHTML: true
            },
            rangeSelector: {
                buttons: [{
                    type: 'day',
                    count: 7,
                    text: '7d'
                }, {
                    type: 'day',
                    count: 15,
                    text: '15d'
                }, {
                    type: 'month',
                    count: 1,
                    text: '1m'
                }, {
                    type: 'month',
                    count: 3,
                    text: '3m'
                }, {
                    type: 'month',
                    count: 6,
                    text: '6m'
                }],
                selected: 0,
                inputEnabled: false
            },
            yAxis: [{
                title: {
                    text: 'Stock Price'
                },
                opposite: false
            }, {
                title: {
                    text: 'Volume'
                }
            }], 
            series: [{
                name: `Stock Price`,
                type: 'area',
                yAxis: 0,
                data: chart,
                tooltip: {
                    valueDecimals: 2
                },
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
                threshold: null
            }, {
                name: `Volume`,
                type: 'column',
                yAxis: 1,
                data: volume,
                tooltip: {
                    valueDecimals: 2
                },
                pointWidth: 3
            }]
        });
    },
    news: function(data){
        components.news.innerHTML = '';
        result = '';
        count = 0;
        i = 0;
        while(count < 5 && i < data.length){
            let {headline, datetime, image, url} = data[i];
            if(headline && datetime && image && url){
                result += generateNewsHTML(headline, generateDateString(datetime, 'D MMMM, YYYY'), url, image);
                count++;
            }
            i++;
        }
        components.news.innerHTML = result;
    }
}

function clear(){
    components.profile.innerHTML = '';
    components.news.innerHTML = '';
    components.charts.innerHTML = '';
    components.summary.innerHTML = '';
}

function deactivateAll(){
    for(let component in components){
        hide(components[component]);
    }
    for(let t in tabs){
        tabs[t].classList.remove('active');
    }
}

function isActive(){
    for(let t in tabs){
        if(tabs[t].classList.contains('active')){
            return t;
        }
    }
    return null;
}

function activate(tab){
    deactivateAll();
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
    let ticker = document.querySelector('#ticker').value.toUpperCase().trim();
    let API_BASE = '/api/v1';

    let PROFILE_URL = `${API_BASE}/${ticker}`;
    let SUMMARY_URL = `${PROFILE_URL}/summary`;
    let CHARTS_URL = `${PROFILE_URL}/chart`;
    let NEWS_URL = `${PROFILE_URL}/news`;
    
    clear();

    let response = await fetch(PROFILE_URL);
    if(response.status == 404){
        hide(content);
        show(error);
        deactivateAll();
    }else{
        hide(error);
        let profile = await response.json();
        populate.profile(profile);
        if(!isActive()){
            activate(tabs.profile);   
        }
        show(content);
        let summary = await fetch(SUMMARY_URL).then((res, err) => res.json());
        populate.summary(summary, profile.symbol);
        let charts = await fetch(CHARTS_URL).then((res, err) => res.json());
        populate.charts(charts, profile.symbol);
        let news = await fetch(NEWS_URL).then((res, err) => res.json());
        populate.news(news);
    }
});

for(let tab in tabs){
    tabs[tab].addEventListener('click', (e) => {
        activate(tabs[tab])
    });
}

document.querySelector('#search button[type="reset"]').addEventListener('click', (e) => {
    clear();
    hide(content);
    hide(error);
    deactivateAll();
})

window.onload = (e) => {
    document.querySelector('#ticker').value = '';
}