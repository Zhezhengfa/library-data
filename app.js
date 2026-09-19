const books = [
  { id: 1,  title: '围城',           author: '钱钟书',   category: '文学', year: 1991, borrowed: false, location: 'A区1架' },
  { id: 2,  title: '平凡的世界',     author: '路遥',     category: '文学', year: 2012, borrowed: true,  location: 'A区2架' },
  { id: 3,  title: '球状闪电',       author: '刘慈欣',   category: '科幻', year: 2017, borrowed: true,  location: 'B区1架' },
  { id: 4,  title: '基地',           author: '阿西莫夫', category: '科幻', year: 2005, borrowed: false, location: 'B区2架' },
  { id: 5,  title: '沙丘',           author: '弗兰克',   category: '科幻', year: 2006, borrowed: true,  location: 'B区3架' },
  { id: 6,  title: '史记',           author: '司马迁',   category: '历史', year: 2010, borrowed: false, location: 'C区1架' },
  { id: 7,  title: '全球通史',       author: '斯塔夫里阿诺斯', category: '历史', year: 2006, borrowed: true, location: 'C区2架' },
  { id: 8,  title: '枪炮、病菌与钢铁', author: '戴蒙德', category: '历史', year: 2016, borrowed: false, location: 'C区3架' },
  { id: 9,  title: '深入理解计算机系统', author: 'Bryant', category: '科技', year: 2016, borrowed: true,  location: 'D区1架' },
  { id: 10, title: '代码大全',       author: 'McConnell', category: '科技', year: 2018, borrowed: false, location: 'D区2架' }
];
let barChart = null;
let lineChart = null;
const initCategoryOptions = () => {
  const cats = [...new Set(books.map(b => b.category))];
  cats.forEach(c => {
    $('#filter-category').append(`<option value="${c}">${c}</option>`);
  });
};
const renderBooks = () => {
  const cat = $('#filter-category').val();
  const status = $('#filter-status').val();
  const keyword = $('#filter-keyword').val().trim().toLowerCase();
  const filtered = books.filter(b => {
    if (cat !== '' && b.category !== cat) return false;
    if (status === 'borrowed' && !b.borrowed) return false;
    if (status === 'available' && b.borrowed) return false;
    if (keyword) {
      const hay = (b.title + b.author).toLowerCase();
      if (!hay.includes(keyword)) return false;
    }
    return true;
  });
  $('#book-list').empty();
  if (filtered.length === 0) {
    $('#book-list').html('<div class="col-12"><div class="alert alert-info">没有符合条件的图书</div></div>');
  } else {
    filtered.forEach(b => {
      const badge = b.borrowed
        ? '<span class="badge bg-warning text-dark">借出中</span>'
        : '<span class="badge bg-success">可借</span>';
      $('#book-list').append(`
        <div class="col-md-6 col-lg-4">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <h3 class="card-title h6 mb-1">${b.title}</h3>
                ${badge}
              </div>
              <p class="card-text small text-muted mb-1">作者：${b.author}</p>
              <p class="card-text small mb-1">类别：${b.category} · ${b.year}年</p>
              <p class="card-text small mb-0">位置：${b.location}</p>
            </div>
          </div>
        </div>
      `);
    });
  }
  $('#book-count').text(`共 ${filtered.length} 册`);
};
const updateStats = () => {
  const borrowed = books.filter(b => b.borrowed).length;
  $('#stat-total').text(books.length);
  $('#stat-borrow').text(borrowed);
  $('#stat-visitors').text(128);
};
const loadChart = async () => {
  $('#status').text('加载中...').show();
  try {
    const res = await fetch('data/books.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (data.series.length === 0) {
      $('#status').text('暂无数据').show();
      return;
    }
    $('#sub-title').text(data.title + ' · 数据来源：图书馆模拟数据集');
    $('#status').hide();
    renderBarChart(data);
    renderLineChart(data);
  } catch (err) {
    $('#status').text('加载失败：' + err.message).show();
  }
};
const renderBarChart = (data) => {
  if (barChart === null) {
    barChart = echarts.init(document.querySelector('#bar-chart'));
  }
  barChart.setOption({
    title: { text: '各品类月度借阅量', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0 },
    xAxis: { type: 'category', data: data.months },
    yAxis: { type: 'value', name: '册' },
    series: data.series.map(s => ({
      name: s.category,
      type: 'bar',
      data: s.counts
    }))
  });
};
const renderLineChart = (data) => {
  if (lineChart === null) {
    lineChart = echarts.init(document.querySelector('#line-chart'));
  }
  lineChart.setOption({
    title: { text: '月度借阅总量趋势', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: data.months },
    yAxis: { type: 'value', name: '册' },
    series: [{
      name: '总借阅量',
      type: 'line',
      smooth: true,
      data: data.months.map((m, i) =>
        data.series.reduce((sum, s) => sum + s.counts[i], 0)
      ),
      itemStyle: { color: '#198754' },
      areaStyle: {}
    }]
  });
};
window.addEventListener('resize', () => {
  if (barChart) barChart.resize();
  if (lineChart) lineChart.resize();
});
$(function () {
  initCategoryOptions();
  renderBooks();
  updateStats();
  loadChart();
  $('#filter-category, #filter-status').on('change', renderBooks);
  $('#filter-keyword').on('input', renderBooks);
  $('#btn-reset').on('click', () => {
    $('#filter-category').val('');
    $('#filter-status').val('');
    $('#filter-keyword').val('');
    renderBooks();
  });
});