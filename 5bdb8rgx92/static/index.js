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
            document.querySelector('#summary #ss').innerHTML = '-';
            document.querySelector('#summary #s').innerHTML = '-';
            document.querySelector('#summary #h').innerHTML = '-';
            document.querySelector('#summary #b').innerHTML = '-';
            document.querySelector('#summary #sb').innerHTML = '-';
        }
                
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
                text: `Stock Price ${ticker} {2021-07-22}`
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
                selected: 4,
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
        count = 0;
        i = 0;
        while(count < 5 && i < data.length){
            let {headline, datetime, image, url} = data[i];
            if(headline && datetime && image && url && count < 5){
                components.news.innerHTML += generateNewsHTML(headline, datetime, url, image);
                count++;
            }
            i++;
        }
    }
}

function clear(){
    document.querySelector('#company #name').innerHTML = '';
    document.querySelector('#company #company-symbol').innerHTML = '';
    document.querySelector('#company #code').innerHTML = '';
    document.querySelector('#company #ipo').innerHTML = '';
    document.querySelector('#company #category').innerHTML = '';
    document.querySelector('#company #company-logo').setAttribute('src', '');
    components.news.innerHTML = '';
    document.querySelector('#summary #ss').innerHTML = '';
    document.querySelector('#summary #s').innerHTML = '';
    document.querySelector('#summary #h').innerHTML = '';
    document.querySelector('#summary #b').innerHTML = '';
    document.querySelector('#summary #sb').innerHTML = '';
    document.querySelector('#summary #day').innerHTML = '';
    document.querySelector('#summary #summary-symbol').innerHTML = '';
    document.querySelector('#summary #close').innerHTML = '';
    document.querySelector('#summary #open').innerHTML = '';
    document.querySelector('#summary #low').innerHTML = '';
    document.querySelector('#summary #high').innerHTML = '';
    document.querySelector('#summary #change').innerHTML = generateChangeHTML(0);
    document.querySelector('#summary #change-pct').innerHTML = generateChangePctHTML(0);
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
})