$(() => {
  let stickyTop = 0,
      scrollTarget = false;

  let timeline = $('.timeline__nav'),
      items = $('li', timeline),
      milestones = $('.timeline__section .milestone'),
      offsetTop = parseInt(timeline.css('top'));

  const TIMELINE_VALUES = {
    start: 300,
    step: 30 };


  $(window).resize(function () {
    timeline.removeClass('fixed');

    stickyTop = timeline.offset().top - offsetTop;

    $(window).trigger('scroll');
  }).trigger('resize');

  $(window).scroll(function () {
    if ($(window).scrollTop() > stickyTop) {
      timeline.addClass('fixed');
    } else {
      timeline.removeClass('fixed');
    }
  }).trigger('scroll');

  items.find('span').click(function () {
    let li = $(this).parent(),
        index = li.index(),
        milestone = milestones.eq(index);

    if (!li.hasClass('active') && milestone.length) {
      scrollTarget = index;

      //let scrollTargetTop = milestone.offset().top - 100;
      let scrollTargetTop = milestone.offset().top -300;

      $('html, body').animate({ scrollTop: scrollTargetTop }, {
        duration: 400,
        complete: function complete() {
          scrollTarget = false;
        } });

    }
  });

  function changeto(l,roindex){
    let rotate = projection.rotate()
    const Versor = iVersor();
    let versorInterpolator = Versor.interpolateAngles(rotate, [-l[0], -l[1], -l[2]]);
    svg.transition()
        .duration(1100)
        .tween('r',function(){
          return function(t){
            let newRotate = versorInterpolator(t);
            projection.rotate(newRotate)
            path = d3.geoPath().projection(projection)
            svg.selectAll('path').attr('d',path)
          }
        })
    //读取数据
    d3.csv("kill&wounddata.csv")
        .then(function(data){

          const groupedData = d3.group(data, d => d.iyear); // 按照年份分组
          const sortedData = Array.from(groupedData).sort((a, b) => d3.ascending(a[0], b[0])); // 按照年份排序
          const nestedData = sortedData.map(d => ({key: d[0], values: d[1]})); // 添加一个key属性
          const roindex1 = + roindex; //把roindex变成int
          const circleData = nestedData[roindex1-1].values.map(d => { // 选择当年的数据
            return {
              coordinates: [d.longitude, d.latitude],
              radius: +d.radius
            };
          });

          const circles = circleData.map(d => {
            return d3.geoCircle().center(d.coordinates).radius(d.radius)();
          });

          d3.selectAll('pointmap').remove()

          pointmap.selectAll("path.circle")
              .data(circles)
              .join("path")
              .attr("class", "circle")
              .attr("fill", "rgba(205, 11, 10, 0.2)")
              .attr("stroke", "#800000")
              .style("stroke-width", 1.2)
              .attr("d", path);
        });
    pointmap.raise();

  }



  function iVersor(){return(
      class Versor {
        static fromAngles([l, p, g]) {
          l *= Math.PI / 360;
          p *= Math.PI / 360;
          g *= Math.PI / 360;
          const sl = Math.sin(l), cl = Math.cos(l);
          const sp = Math.sin(p), cp = Math.cos(p);
          const sg = Math.sin(g), cg = Math.cos(g);
          return [
            cl * cp * cg + sl * sp * sg,
            sl * cp * cg - cl * sp * sg,
            cl * sp * cg + sl * cp * sg,
            cl * cp * sg - sl * sp * cg
          ];
        }
        static toAngles([a, b, c, d]) {
          return [
            Math.atan2(2 * (a * b + c * d), 1 - 2 * (b * b + c * c)) * 180 / Math.PI,
            Math.asin(Math.max(-1, Math.min(1, 2 * (a * c - d * b)))) * 180 / Math.PI,
            Math.atan2(2 * (a * d + b * c), 1 - 2 * (c * c + d * d)) * 180 / Math.PI
          ];
        }
        static interpolateAngles(a, b) {
          const i = Versor.interpolate(Versor.fromAngles(a), Versor.fromAngles(b));
          return t => Versor.toAngles(i(t));
        }
        static interpolateLinear([a1, b1, c1, d1], [a2, b2, c2, d2]) {
          a2 -= a1, b2 -= b1, c2 -= c1, d2 -= d1;
          const x = new Array(4);
          return t => {
            const l = Math.hypot(x[0] = a1 + a2 * t, x[1] = b1 + b2 * t, x[2] = c1 + c2 * t, x[3] = d1 + d2 * t);
            x[0] /= l, x[1] /= l, x[2] /= l, x[3] /= l;
            return x;
          };
        }
        static interpolate([a1, b1, c1, d1], [a2, b2, c2, d2]) {
          let dot = a1 * a2 + b1 * b2 + c1 * c2 + d1 * d2;
          if (dot < 0) a2 = -a2, b2 = -b2, c2 = -c2, d2 = -d2, dot = -dot;
          if (dot > 0.9995) return Versor.interpolateLinear([a1, b1, c1, d1], [a2, b2, c2, d2]);
          const theta0 = Math.acos(Math.max(-1, Math.min(1, dot)));
          const x = new Array(4);
          const l = Math.hypot(a2 -= a1 * dot, b2 -= b1 * dot, c2 -= c1 * dot, d2 -= d1 * dot);
          a2 /= l, b2 /= l, c2 /= l, d2 /= l;
          return t => {
            const theta = theta0 * t;
            const s = Math.sin(theta);
            const c = Math.cos(theta);
            x[0] = a1 * c + a2 * s;
            x[1] = b1 * c + b2 * s;
            x[2] = c1 * c + c2 * s;
            x[3] = d1 * c + d2 * s;
            return x;
          };
        }
      }
  )}

//定义着色国家
  const country_list=[
    //1970
    ['Switzerland', 'Netherlands', 'Colombia', 'United_States', 'Nicaragua', 'Ireland', 'Venezuela', 'Turkey', 'Philippines', 'Dominican_Republic', 'Japan', 'Lebanon', 'Pakistan', 'Spain', 'Australia', 'Ethiopia', 'Mexico', 'Canada', 'Belgium', 'Jordan', 'Bolivia', 'Uruguay', 'Brazil', 'Greece', 'Argentina', 'Italy', 'Guatemala', 'Egypt', 'Germany', 'United_Kingdom', 'Iran', 'Paraguay'],
    ['Costa_Rica', 'Switzerland', 'Netherlands', 'United_States', 'Ireland', 'Venezuela', 'Cambodia', 'Poland', 'Turkey', 'Philippines', 'Dominican_Republic', 'Lebanon', 'Spain', 'Australia', 'South_Yemen', 'Ethiopia', 'Zambia', 'Israel', 'Sweden', 'Jordan', 'Bolivia', 'Uruguay', 'Taiwan', 'Brazil', 'Greece', 'Argentina', 'Italy', 'Guatemala', 'Egypt', 'Germany', 'United_Kingdom', 'Iran'],
    ['Switzerland', 'Netherlands', 'Colombia', 'United_States', 'Ireland', 'Venezuela', 'Cambodia', 'Panama', 'Turkey', 'El_Salvador', 'Thailand', 'Philippines', 'Austria', 'Lebanon', 'West_Bank_and_Gaza_Strip', 'Spain', 'Australia', 'Mexico', 'Canada', 'Zaire', "Congo", 'France', 'Israel', 'Belgium', 'Sweden', 'Jordan', 'Uruguay', 'Brazil', 'Czechoslovakia', 'Algeria', 'Greece', 'India', 'Argentina', 'Portugal', 'Italy', 'Egypt', 'Germany', 'United_Kingdom', 'Brunei', 'Kuwait', 'Iran'],
    ['Chile', 'Honduras', 'Malaysia', 'Switzerland', 'Netherlands', 'Colombia', 'United_States', 'Morocco', 'Myanmar', 'Ireland', 'New_Zealand', 'Venezuela', 'El_Salvador', 'Dominican_Republic', 'Austria', 'Japan', 'Lebanon', 'Cyprus', 'Spain', 'Ethiopia', 'Zambia', 'Mexico', 'Zaire', 'Sudan', 'France', 'Israel', 'Belgium', 'Jordan', 'Yugoslavia', 'Ecuador', 'Brazil', 'Greece', 'Argentina', 'Portugal', 'Italy', 'Afghanistan', 'Haiti', 'Germany', 'United_Kingdom', 'Iran', 'Peru'],
    ['North_Yemen', 'Switzerland', 'Netherlands', 'United_States', 'Nicaragua', 'Ireland', 'Venezuela', 'Turkey', 'El_Salvador', 'Thailand', 'Philippines', 'Dominican_Republic', 'Austria', 'Japan', 'Lebanon', 'Pakistan', 'South_Korea', 'Australia', 'Spain', 'Ethiopia', 'Jamaica', 'Mexico', 'Canada', 'France', 'Israel', 'Belgium', 'Bolivia', 'Yugoslavia', 'Ecuador', 'United_Arab_Emirates', 'Greece', 'Chad', 'Singapore', 'Argentina', 'Syria', 'Italy', 'Guatemala', 'Andorra', 'Botswana', 'Haiti', 'South_Africa', 'Germany', 'United_Kingdom', 'Kuwait', 'Iran', 'Peru'],
    ['Malaysia', 'Switzerland', 'Netherlands', 'Colombia', 'United_States', 'Nicaragua', 'Ireland', 'Venezuela', 'Turkey', 'El_Salvador', 'Philippines', 'Japan', 'Austria', 'Lebanon', 'Pakistan', 'Cyprus', 'Spain', 'Ethiopia', 'Zambia', 'Mexico', 'France', 'Israel', 'Sweden', 'Tanzania', 'Greece', 'Kenya', 'India', 'Namibia', 'Argentina', 'Syria', 'Portugal', 'Italy', 'Iraq', 'Guatemala', 'Somalia', 'Germany', 'United_Kingdom', 'Kuwait', 'Iran', 'Peru', 'Sri_Lanka'],
    ['Costa_Rica', 'Chile', 'Switzerland', 'Netherlands', 'Colombia', 'United_States', 'Morocco', 'Myanmar', 'Ireland', 'Venezuela', 'Panama', 'Turkey', 'El_Salvador', 'Philippines', 'Japan', 'Austria', 'Lebanon', 'Pakistan', 'West_Bank_and_Gaza_Strip', 'Spain', 'Ethiopia', 'Jamaica', 'Mexico', 'France', 'Israel', 'Belgium', 'Jordan', 'Bolivia', 'Taiwan', 'Ecuador', 'Brazil', 'Algeria', 'Greece', 'Kenya', 'India', 'Bahamas', 'Namibia', 'Barbados', 'Argentina', 'Syria', 'Trinidad_and_Tobago', 'Portugal', 'Italy', 'Guatemala', 'Iraq', 'Nigeria', 'South_Africa', 'Germany', 'United_Kingdom', 'Kuwait', 'Iran', 'Paraguay'],
    ['North_Yemen', 'Costa_Rica', 'Chile', 'Malaysia', 'Switzerland', 'Netherlands', 'Colombia', 'United_States', 'Nicaragua', 'Indonesia', 'Ireland', 'Venezuela', 'Turkey', 'El_Salvador', 'Thailand', 'Philippines', 'Saudi_Arabia', 'Japan', 'Austria', 'Lebanon', 'Cyprus', 'Spain', 'Ethiopia', 'Zambia', 'Mexico', 'Zaire', "Congo", 'France', 'Israel', 'Belgium', 'Bolivia', 'Yugoslavia', 'Ecuador', 'Brazil', 'United_Arab_Emirates', 'Greece', 'India', 'Argentina', 'Syria', 'Portugal', 'Bangladesh', 'Italy', 'Egypt', 'Guatemala', 'South_Africa', 'Mauritania', 'Angola', 'Germany', 'United_Kingdom', 'Iran', 'Djibouti', 'Malta', 'Peru'],
    ['Soviet_Union', 'North_Yemen', 'Costa_Rica', 'Chile', 'Switzerland', 'Netherlands', 'Colombia', 'United_States', 'Nicaragua', 'Indonesia', 'Morocco', 'Ireland', 'Venezuela', 'Cambodia', 'Turkey', 'El_Salvador', 'Thailand', 'Philippines', 'Dominican_Republic', 'Austria', 'Japan', 'Lebanon', 'Cyprus', 'Pakistan', 'West_Bank_and_Gaza_Strip', 'Spain', 'Australia', 'Ethiopia', 'Zambia', 'Mexico', 'France', 'Israel', 'Belgium', 'Sweden', 'Bolivia', 'Ecuador', 'Brazil', 'Algeria', 'Rhodesia', 'Greece', 'United_Arab_Emirates', 'Kenya', 'Namibia', 'Argentina', 'Guyana', 'Syria', 'Portugal', 'Western_Sahara', 'Italy', 'Egypt', 'Guatemala', 'South_Africa', 'Angola', 'Germany', 'United_Kingdom', 'Kuwait', 'Iran', 'Mozambique', 'Peru', 'Denmark'],
    ['Costa_Rica', 'Chile', 'Honduras', 'Malaysia', 'Switzerland', 'Netherlands', 'Colombia', 'United_States', 'Norway', 'Nicaragua', 'Morocco', 'Myanmar', 'Ireland', 'Venezuela', 'Panama', 'Tunisia', 'Poland', 'Turkey', 'El_Salvador', 'Thailand', 'Philippines', 'Saudi_Arabia', 'Dominican_Republic', 'Austria', 'Japan', 'Lebanon', 'Cyprus', 'Pakistan', 'West_Bank_and_Gaza_Strip', 'Libya', 'Australia', 'Spain', 'Ethiopia', 'Gabon', 'Jamaica', 'Mexico', 'Zambia', 'Bahrain', 'France', 'Israel', 'Belgium', 'Sweden', 'Lesotho', 'Tanzania', 'Bolivia', 'Ecuador', 'Brazil', 'Algeria', 'Rhodesia', 'Greece', 'United_Arab_Emirates', 'India', 'Namibia', 'Argentina', 'Guyana', 'Syria', 'Trinidad_and_Tobago', 'Portugal', 'Bangladesh', 'Italy', 'Egypt', 'Guatemala', 'Iraq', 'Afghanistan', 'South_Africa', 'Angola', 'Germany', 'United_Kingdom', 'Iran', 'Djibouti', 'Mozambique', 'Peru', 'Sri_Lanka', 'Uganda', 'Denmark'],
    //1980
    ['Grenada', 'Costa_Rica', 'Chile', 'Honduras', 'Switzerland', 'Netherlands', 'Colombia', 'Guinea', 'United_States', 'Nicaragua', 'Myanmar', 'Zimbabwe', 'Ireland', 'Venezuela', 'Senegal', 'Panama', 'Tunisia', 'Hong_Kong', 'El_Salvador', 'Thailand', 'Turkey', 'Philippines', 'Dominican_Republic', 'Austria', 'Lebanon', 'Pakistan', 'Cyprus', 'West_Bank_and_Gaza_Strip', 'Libya', 'Australia', 'Spain', 'Jamaica', 'Mexico', 'Canada', 'Bahrain', 'France', 'Israel', 'Belgium', 'New_Hebrides', 'Jordan', 'Bolivia', 'Yugoslavia', 'Ecuador', 'Brazil', 'Rhodesia', 'United_Arab_Emirates', 'Greece', 'Kenya', 'India', 'Namibia', 'Argentina', 'Guyana', 'Syria', 'Portugal', 'Bangladesh', 'Italy', 'Guadeloupe', 'Egypt', 'Belize', 'Guatemala', 'Iraq', 'Somalia', 'Nigeria', 'South_Africa', 'Germany', 'United_Kingdom', 'Kuwait', 'Iran', 'Peru', 'Paraguay', 'Denmark'],
    ['North_Yemen', 'Costa_Rica', 'Chile', 'Honduras', 'Switzerland', 'Netherlands', 'Colombia', 'United_States', 'Norway', 'Nicaragua', 'Indonesia', 'New_Zealand', 'Ireland', 'Venezuela', 'Zimbabwe', 'Panama', 'Poland', 'Hong_Kong', 'El_Salvador', 'Thailand', 'Turkey', 'Philippines', 'Japan', 'Austria', 'Lebanon', 'Pakistan', 'Cyprus', 'West_Bank_and_Gaza_Strip', 'Dominica', 'Australia', 'Spain', 'Jamaica', 'Zambia', 'Mexico', 'Sudan', 'France', 'Israel', 'Belgium', 'Lesotho', 'Central_African_Republic', 'Jordan', 'Bolivia', 'Yugoslavia', 'Ecuador', 'Brazil', 'United_Arab_Emirates', 'Greece', 'India', 'Bahamas', 'Argentina', 'Guyana', 'Syria', 'Trinidad_and_Tobago', 'Portugal', 'Bangladesh', 'Italy', 'Guadeloupe', 'Egypt', 'Guatemala', 'Iraq', 'Somalia', 'Seychelles', 'South_Africa', 'Angola', 'Vatican_City', 'Germany', 'United_Kingdom', 'Kuwait', 'Iran', 'Mozambique', 'Uganda', 'Peru', 'Sri_Lanka', 'Denmark', 'Martinique', 'Albania'],
    ['Costa_Rica', 'Chile', 'Honduras', 'Switzerland', 'Netherlands', 'Colombia', 'United_States', 'Nicaragua', 'Myanmar', 'Zimbabwe', 'Ireland', 'Venezuela', 'Turkey', 'El_Salvador', 'Thailand', 'Philippines', 'Dominican_Republic', 'Austria', 'Japan', 'Lebanon', 'Cyprus', 'Pakistan', 'West_Bank_and_Gaza_Strip', 'South_Korea', 'Australia', 'Spain', 'Mexico', 'Canada', "Congo", 'Sudan', 'France', 'Israel', 'Belgium', 'Tanzania', 'Lesotho', 'Jordan', 'Bolivia', 'Ecuador', 'Brazil', 'Greece', 'Suriname', 'India', 'Namibia', 'Argentina', 'Swaziland', 'Syria', 'Qatar', 'Portugal', 'Bangladesh', 'Italy', 'Egypt', 'Guatemala', 'Iraq', 'South_Africa', 'Angola', 'Germany', 'United_Kingdom', 'Kuwait', 'Bulgaria', 'Iran', 'Mozambique', 'Uganda', 'Peru', 'Sri_Lanka'],
    ['Grenada', 'Costa_Rica', 'Chile', 'Honduras', 'Malaysia', 'Switzerland', 'Netherlands', 'Colombia', 'United_States', 'Nicaragua', 'Myanmar', 'Zimbabwe', 'Ireland', 'Venezuela', 'Panama', 'Iceland', 'Turkey', 'El_Salvador', 'Thailand', 'Philippines', 'Japan', 'Lebanon', 'Pakistan', 'Cyprus', 'West_Bank_and_Gaza_Strip', 'South_Korea', 'Spain', 'South_Yemen', 'Ethiopia', 'Mexico', 'Canada', 'Sudan', 'France', 'Israel', 'Belgium', 'Sweden', 'Lesotho', 'Jordan', 'Bolivia', 'Yugoslavia', 'Ecuador', 'Brazil', 'United_Arab_Emirates', 'Greece', 'Suriname', 'India', 'Namibia', 'Luxembourg', 'Argentina', 'Syria', 'Trinidad_and_Tobago', 'Portugal', 'Italy', 'Guadeloupe', 'Guatemala', 'Falkland_Islands', 'Iraq', 'Somalia', 'Nigeria', 'South_Africa', 'Haiti', 'Angola', 'Germany', 'United_Kingdom', 'Kuwait', 'Iran', 'Mozambique', 'Uganda', 'Peru', 'Sri_Lanka', 'Martinique', 'French_Guiana'],
    ['Costa_Rica', 'Chile', 'Honduras', 'Switzerland', 'Netherlands', 'Colombia', 'United_States', 'Nicaragua', 'Indonesia', 'New_Zealand', 'Ireland', 'Venezuela', 'Zimbabwe', 'Panama', 'Burkina_Faso', 'Turkey', 'El_Salvador', 'Thailand', 'Philippines', 'Saudi_Arabia', 'Japan', 'Austria', 'Lebanon', 'Pakistan', 'Cyprus', 'West_Bank_and_Gaza_Strip', 'Libya', 'Spain', 'Ethiopia', 'Mexico', 'Zaire', 'Sudan', 'France', 'Israel', 'Belgium', 'Lesotho', 'Jordan', 'Bolivia', 'Uruguay', 'Yugoslavia', 'Ecuador', 'Brazil', 'Greece', 'Chad', 'Suriname', 'India', 'Namibia', 'Argentina', 'Swaziland', 'Syria', 'Portugal', 'Bangladesh', 'Italy', 'Guadeloupe', 'Guatemala', 'Iraq', 'Romania', 'Somalia', 'Western_Sahara', 'South_Africa', 'Angola', 'Germany', 'United_Kingdom', 'Kuwait', 'Bulgaria', 'Iran', 'Malta', 'Mozambique', 'Peru', 'Paraguay', 'Sri_Lanka', 'Uganda', 'Martinique', 'New_Caledonia'],
    ['Costa_Rica', 'Chile', 'Honduras', 'Switzerland', 'Netherlands', 'Colombia', 'United_States', 'Nicaragua', 'Indonesia', 'Morocco', 'Ireland', 'Venezuela', 'Zimbabwe', 'Turkey', 'El_Salvador', 'Thailand', 'Philippines', 'Saudi_Arabia', 'Japan', 'Austria', 'Lebanon', 'Pakistan', 'Cyprus', 'West_Bank_and_Gaza_Strip', 'Spain', 'Ethiopia', 'Zambia', 'Mexico', 'Canada', 'France', 'Israel', 'Belgium', 'Togo', 'Niger', 'Bolivia', 'Uruguay', 'Ecuador', 'Brazil', 'United_Arab_Emirates', 'Greece', 'Chad', 'Singapore', 'India', 'Namibia', 'Luxembourg', 'Argentina', 'Syria', 'Portugal', 'Bangladesh', 'Italy', 'Guadeloupe', 'Egypt', 'Guatemala', 'Romania', 'South_Africa', 'Botswana', 'Angola', 'Nepal', 'Germany', 'United_Kingdom', 'Kuwait', 'Iran', 'Malta', 'Mozambique', 'Peru', 'Paraguay', 'Sri_Lanka', 'Denmark', 'Uganda', 'New_Caledonia'],
    ['Finland', 'Costa_Rica', 'Chile', 'Honduras', 'Malaysia', 'Netherlands', 'Colombia', 'United_States', 'Nicaragua', 'Indonesia', 'Morocco', 'Ireland', 'Venezuela', 'Zimbabwe', 'Panama', 'Tunisia', 'Iceland', 'Turkey', 'El_Salvador', 'Thailand', 'Philippines', 'Saudi_Arabia', 'Japan', 'Austria', 'Lebanon', 'Pakistan', 'Cyprus', 'West_Bank_and_Gaza_Strip', 'South_Korea', 'Australia', 'Spain', 'Ethiopia', 'Jamaica', 'Zambia', 'Mexico', 'Canada', 'Sudan', 'France', 'Israel', 'Belgium', 'Sweden', 'Central_African_Republic', 'Bolivia', 'Uruguay', 'Ecuador', 'Brazil', 'United_Arab_Emirates', 'Greece', 'Chad', 'Suriname', 'India', 'Namibia', 'Luxembourg', 'Argentina', 'Swaziland', 'Syria', 'Portugal', 'Bangladesh', 'Italy', 'Guadeloupe', 'Egypt', 'Guatemala', 'Western_Sahara', 'South_Africa', 'Angola', 'Germany', 'United_Kingdom', 'Kuwait', 'Iran', 'Malta', 'Mozambique', 'Peru', 'Sri_Lanka', 'Uganda', 'Denmark', 'New_Caledonia'],
    ['Costa_Rica', 'Chile', 'Honduras', 'Switzerland', 'Netherlands', 'Colombia', 'United_States', 'Norway', 'Nicaragua', 'Morocco', 'Myanmar', 'Ireland', 'Venezuela', 'Zimbabwe', 'Panama', 'Tunisia', 'Turkey', 'El_Salvador', 'Philippines', 'Dominican_Republic', 'Austria', 'Japan', 'Lebanon', 'Cyprus', 'Pakistan', 'West_Bank_and_Gaza_Strip', 'Spain', 'Ethiopia', 'Zambia', 'Mexico', 'Sudan', 'France', 'Israel', 'Belgium', 'Bolivia', 'Ecuador', 'Brazil', 'Greece', 'Suriname', 'Singapore', 'India', 'Namibia', 'Argentina', 'Ghana', 'Swaziland', 'Uganda', 'Bangladesh', 'Italy', 'Egypt', 'Guatemala', 'Iraq', 'Somalia', 'Afghanistan', 'Botswana', 'Haiti', 'South_Africa', 'Angola', 'Germany', 'United_Kingdom', 'Kuwait', 'Iran', 'Djibouti', 'Malta', 'Mozambique', 'Paraguay', 'Peru', 'Denmark', 'Fiji', 'Sri_Lanka', 'Martinique'],
    ['North_Yemen', 'Costa_Rica', 'Chile', 'Honduras', 'Malaysia', 'Switzerland', 'Netherlands', 'Colombia', 'United_States', 'Nicaragua', 'Myanmar', 'Zimbabwe', 'Venezuela', 'Senegal', 'Panama', 'Turkey', 'El_Salvador', 'Thailand', 'Philippines', 'Saudi_Arabia', 'Dominican_Republic', 'Austria', 'Japan', 'Lebanon', 'Cyprus', 'Pakistan', 'West_Bank_and_Gaza_Strip', 'South_Korea', 'Australia', 'Spain', 'Ethiopia', 'Zambia', 'Maldives', 'Mexico', 'Zaire', 'Sudan', 'France', 'Israel', 'Belgium', 'Lesotho', 'Jordan', 'Bolivia', 'Ecuador', 'Brazil', 'Greece', 'Suriname', 'India', 'Namibia', 'Argentina', 'Portugal', 'Bangladesh', 'Italy', 'Guadeloupe', 'Egypt', 'Guatemala', 'Iraq', 'Somalia', 'Nigeria', 'Afghanistan', 'Botswana', 'Haiti', 'South_Africa', 'Angola', 'Germany', 'United_Kingdom', 'Kuwait', 'Iran', 'Djibouti', 'Mozambique', 'Peru', 'Sri_Lanka', 'Uganda', 'Denmark', 'Martinique', 'Mauritius', 'New_Caledonia'],
    ['Ireland', 'France', 'Belgium', 'Uruguay', 'Czechoslovakia', 'Greece', 'Namibia', 'Swaziland', 'Qatar', 'Portugal', 'Bangladesh', 'Egypt', 'Guatemala', 'Iraq', 'Germany', 'Iran', 'Mozambique', 'Denmark', 'Malaysia', 'Colombia', 'El_Salvador', 'Philippines', 'Saudi_Arabia', 'Dominican_Republic', 'Cyprus', 'West_Bank_and_Gaza_Strip', 'Sudan', 'Ecuador', 'Papua_New_Guinea', 'Kenya', 'India', 'Argentina', 'Somalia', 'Afghanistan', 'South_Africa', 'Uganda', 'Peru', 'Soviet_Union', 'Costa_Rica', 'Netherlands', 'United_States', 'Nicaragua', 'Indonesia', 'Myanmar', 'Zimbabwe', 'Cambodia', 'Hong_Kong', 'Turkey', 'Lebanon', 'Spain', 'Australia', 'Ethiopia', 'Hungary', 'Niger', 'Bolivia', 'Yugoslavia', 'United_Arab_Emirates', 'Suriname', 'Botswana', 'Angola', 'Sri_Lanka', 'Fiji', 'Chile', 'Honduras', 'Laos', 'Venezuela', 'Panama', 'Thailand', 'Japan', 'Austria', 'Pakistan', 'South_Korea', 'China', 'Zambia', 'Mexico', 'Canada', 'Israel', 'Sweden', 'Brazil', 'Syria', 'Trinidad_and_Tobago', 'Italy', 'Haiti', 'United_Kingdom', 'Mauritius', 'New_Caledonia'],
    //1990
    ['Switzerland', 'Ireland', 'Republic_of_the_Congo', 'France', 'Belgium', 'Jordan', 'Uruguay', 'Taiwan', 'Czechoslovakia', 'Algeria', 'Greece', 'Namibia', 'Guyana', 'Bangladesh', 'Egypt', 'Guatemala', 'Germany', 'Iran', 'Mozambique', 'Malaysia', 'Colombia', 'Senegal', 'El_Salvador', 'Philippines', 'Dominican_Republic', 'Cyprus', 'West_Bank_and_Gaza_Strip', 'Sudan', 'Ecuador', 'Papua_New_Guinea', 'India', 'Argentina', 'Somalia', 'Afghanistan', 'South_Africa', 'Uganda', 'Djibouti', 'Peru', 'Soviet_Union', 'Costa_Rica', 'Netherlands', 'United_States', 'Nicaragua', 'Indonesia', 'Myanmar', 'Zimbabwe', 'Cambodia', 'Poland', 'Liberia', 'Hong_Kong', 'Turkey', 'Lebanon', 'Spain', 'Ethiopia', 'Bolivia', 'Yugoslavia', 'Suriname', 'Botswana', 'Angola', 'Bulgaria', 'Sri_Lanka', 'Albania', 'Chile', 'Honduras', 'Laos', 'Venezuela', 'Panama', 'Thailand', 'Japan', 'Austria', 'Mali', 'Pakistan', 'South_Korea', 'China', 'Zambia', 'Mexico', 'Israel', 'Sweden', 'Brazil', 'Italy', 'Haiti', 'United_Kingdom'],
    ['Switzerland', 'Ireland', 'Georgia', 'Cameroon', 'Sierra_Leone', 'Bahrain', 'France', 'Belgium', 'Yemen', 'Jordan', 'Uruguay', 'Taiwan', 'Czechoslovakia', 'Algeria', 'Greece', 'Chad', 'Namibia', 'Swaziland', 'Bangladesh', 'Egypt', 'Guatemala', 'Iraq', 'Germany', 'Armenia', 'Iran', 'Mozambique', 'Denmark', 'Martinique', 'Malaysia', 'Colombia', 'Norway', 'New_Zealand', 'Senegal', 'Burkina_Faso', 'El_Salvador', 'Philippines', 'Saudi_Arabia', 'Dominican_Republic', 'Cyprus', 'West_Bank_and_Gaza_Strip', 'Sudan', 'Togo', 'Ecuador', 'Papua_New_Guinea', 'Kenya', 'India', 'Argentina', 'Belize', 'Cuba', 'Somalia', 'Nigeria', 'Afghanistan', 'South_Africa', 'Uganda', 'Djibouti', 'Peru', 'Soviet_Union', 'Lithuania', 'Costa_Rica', 'Netherlands', 'United_States', 'Nicaragua', 'Indonesia', 'Morocco', 'Myanmar', 'Zimbabwe', 'Cambodia', 'Liberia', 'Hong_Kong', 'Turkey', 'Azerbaijan', 'Lebanon', 'Spain', 'Australia', 'Ethiopia', 'Jamaica', 'Zaire', 'Hungary', 'Central_African_Republic', 'Niger', 'Bolivia', 'Yugoslavia', 'Suriname', 'Singapore', 'Guadeloupe', 'Angola', 'Nepal', 'Kuwait', 'Bulgaria', 'Sri_Lanka', 'Fiji', 'Albania', 'Chile', 'Honduras', 'Rwanda', 'Venezuela', 'Panama', 'Tunisia', 'Thailand', 'Japan', 'Austria', 'Mali', 'Pakistan', 'South_Korea', 'China', 'Mexico', 'Israel', 'Sweden', 'Brazil', 'Trinidad_and_Tobago', 'Ukraine', 'Italy', 'Moldova', 'Romania', 'Burundi', 'Haiti', 'United_Kingdom', 'Madagascar', 'Croatia'],
    ['Switzerland', 'Guinea', 'Ireland', 'Georgia', 'Cameroon', 'Sierra_Leone', 'Bosnia-Herzegovina', 'France', 'Belgium', 'Yemen', 'Jordan', 'Uruguay', 'Taiwan', 'Czechoslovakia', 'Algeria', 'Greece', 'Chad', 'Swaziland', 'Guyana', 'Portugal', 'Bangladesh', 'Egypt', 'Guatemala', 'Iraq', 'Germany', 'Armenia', 'Malawi', 'Iran', 'Malta', 'Mozambique', 'Paraguay', 'Denmark', 'Martinique', 'Finland', 'Malaysia', 'Benin', 'Colombia', 'Norway', 'Senegal', 'El_Salvador', 'Philippines', 'Dominican_Republic', 'Cyprus', 'West_Bank_and_Gaza_Strip', 'Sudan', 'Togo', 'Ecuador', 'Papua_New_Guinea', 'Kenya', 'India', 'Kazakhstan', 'Argentina', 'Western_Sahara', 'Belize', 'Cuba', 'Estonia', 'Somalia', 'Nigeria', 'Afghanistan', 'South_Africa', 'Uganda', 'Djibouti', 'Peru', 'Lithuania', 'Costa_Rica', 'Netherlands', 'United_States', 'Equatorial_Guinea', 'Nicaragua', 'Indonesia', 'Morocco', 'Myanmar', 'Zimbabwe', 'Cambodia', 'Poland', 'Liberia', 'Hong_Kong', 'Turkey', 'Azerbaijan', 'Lebanon', 'Tajikistan', 'Spain', 'Australia', 'Ethiopia', 'Jamaica', 'Zaire', 'Hungary', 'Central_African_Republic', 'Niger', 'Bolivia', 'Yugoslavia', 'United_Arab_Emirates', 'Suriname', 'Singapore', 'Comoros', 'Angola', 'Nepal', 'Vietnam', 'Brunei', 'Bulgaria', 'Kuwait', 'Sri_Lanka', 'Fiji', 'Albania', 'Chile', 'Honduras', 'Rwanda', 'Uzbekistan', 'Laos', 'Ivory_Coast', 'Venezuela', 'Panama', 'Thailand', 'Japan', 'Austria', 'Mali', 'Pakistan', 'Libya', 'South_Korea', 'China', 'Mexico', 'Canada', 'Israel', 'Sweden', 'Brazil', 'Barbados', 'Ghana', 'Antigua_and_Barbuda', 'Trinidad_and_Tobago', 'Ukraine', 'Italy', 'Moldova', 'Romania', 'Russia', 'Burundi', 'Latvia', 'Haiti', 'United_Kingdom', 'Madagascar', 'Croatia', 'New_Caledonia'],
    [],
    ['Guinea', 'Macedonia', 'Ireland', 'Georgia', 'Republic_of_the_Congo', 'Cameroon', 'Sierra_Leone', 'Bahrain', 'Bosnia-Herzegovina', 'France', 'Belgium', 'North_Korea', 'Yemen', 'Jordan', 'Uruguay', 'Taiwan', 'Algeria', 'Greece', 'Chad', 'Namibia', 'Luxembourg', 'Portugal', 'Bangladesh', 'Czech_Republic', 'Egypt', 'Guatemala', 'Iraq', 'Germany', 'Armenia', 'Iran', 'Mozambique', 'Paraguay', 'Finland', 'Benin', 'Colombia', 'Norway', 'New_Zealand', 'Senegal', 'Slovak_Republic', 'El_Salvador', 'Philippines', 'Saudi_Arabia', 'Dominican_Republic', 'Cyprus', 'West_Bank_and_Gaza_Strip', 'Sudan', 'Tanzania', 'Togo', 'Gambia', 'Ecuador', 'Papua_New_Guinea', 'Kenya', 'India', 'Kazakhstan', 'Argentina', 'Estonia', 'Cuba', 'Somalia', 'Nigeria', 'Afghanistan', 'South_Africa', 'Uganda', 'Djibouti', 'Peru', 'Costa_Rica', 'Netherlands', 'United_States', 'Nicaragua', 'Indonesia', 'Morocco', 'Myanmar', 'Zimbabwe', 'Cambodia', 'Poland', 'Liberia', 'Hong_Kong', 'Turkey', 'Azerbaijan', 'Lebanon', 'Tajikistan', 'Spain', 'Australia', 'Ethiopia', 'Jamaica', 'Zaire', 'Hungary', 'Central_African_Republic', 'Lesotho', 'Niger', 'Bolivia', 'Yugoslavia', 'Suriname', 'Singapore', 'Comoros', 'Angola', 'Nepal', 'Vietnam', 'Kuwait', 'Bulgaria', 'Sri_Lanka', 'Belarus', 'Albania', 'Chile', 'Honduras', 'Rwanda', 'Laos', 'Ivory_Coast', 'Venezuela', 'Panama', 'Tunisia', 'Thailand', 'Japan', 'Austria', 'Mali', 'Pakistan', 'Slovenia', 'South_Korea', 'China', 'Gabon', 'Mexico', 'Canada', 'Israel', 'Sweden', 'Brazil', 'Ghana', 'Trinidad_and_Tobago', 'Wallis_and_Futuna', 'Ukraine', 'Italy', 'Moldova', 'Russia', 'Burundi', 'Latvia', 'Haiti', 'United_Kingdom', 'Croatia'],
    ['Switzerland', 'Macedonia', 'Ireland', 'Georgia', 'Cameroon', 'Sierra_Leone', 'Bahrain', 'Bosnia-Herzegovina', 'France', 'Belgium', 'Yemen', 'Jordan', 'Uruguay', 'Taiwan', 'Algeria', 'Greece', 'Chad', 'Swaziland', 'Portugal', 'Bangladesh', 'Czech_Republic', 'Egypt', 'Guatemala', 'Iraq', 'Eritrea', 'Germany', 'Armenia', 'Iran', 'Malta', 'French_Polynesia', 'Mozambique', 'Paraguay', 'Denmark', 'Finland', 'Benin', 'Colombia', 'Macau', 'Senegal', 'Slovak_Republic', 'El_Salvador', 'Philippines', 'Saudi_Arabia', 'Cyprus', 'West_Bank_and_Gaza_Strip', 'Sudan', 'Tanzania', 'Togo', 'Gambia', 'Ecuador', 'Papua_New_Guinea', 'Kenya', 'India', 'Argentina', 'Estonia', 'Somalia', 'Nigeria', 'Afghanistan', 'South_Africa', 'Uganda', 'Djibouti', 'Peru', 'Lithuania', 'Netherlands', 'United_States', 'Nicaragua', 'Indonesia', 'Morocco', 'Myanmar', 'Zimbabwe', 'Cambodia', 'Poland', 'Hong_Kong', 'Turkey', 'Azerbaijan', 'Lebanon', 'Tajikistan', 'Spain', 'Australia', 'Ethiopia', 'Jamaica', 'Zaire', 'Niger', 'Bolivia', 'Yugoslavia', 'United_Arab_Emirates', 'Botswana', 'Angola', 'Vietnam', 'Bulgaria', 'Sri_Lanka', 'Chile', 'Honduras', 'Rwanda', 'Uzbekistan', 'Ivory_Coast', 'Venezuela', 'Panama', 'Tunisia', 'Thailand', 'Japan', 'Austria', 'Mali', 'Pakistan', 'Libya', 'South_Korea', 'China', 'Zambia', 'Mexico', 'Canada', 'Israel', 'Sweden', 'Brazil', 'Ghana', 'Trinidad_and_Tobago', 'Ukraine', 'Italy', 'Romania', 'Russia', 'Burundi', 'Latvia', 'Haiti', 'United_Kingdom', 'Madagascar', 'Croatia', 'St._Kitts_and_Nevis'],
    ['Switzerland', 'Guinea', 'Ireland', 'Georgia', 'Republic_of_the_Congo', 'Sierra_Leone', 'Bahrain', 'Bosnia-Herzegovina', 'France', 'Yemen', 'Jordan', 'Uruguay', 'Taiwan', 'Algeria', 'Greece', 'Chad', 'Qatar', 'Bangladesh', 'Czech_Republic', 'Egypt', 'Guatemala', 'Iraq', 'Eritrea', 'Germany', 'Armenia', 'Iran', 'Benin', 'Colombia', 'Macau', 'Norway', 'New_Zealand', 'Slovak_Republic', 'El_Salvador', 'Philippines', 'Saudi_Arabia', 'Dominican_Republic', 'Cyprus', 'West_Bank_and_Gaza_Strip', 'Sudan', 'Togo', 'Ecuador', 'Papua_New_Guinea', 'Kenya', 'India', 'Argentina', 'Estonia', 'Cuba', 'Somalia', 'Nigeria', 'Afghanistan', 'South_Africa', 'Mauritania', 'Vanuatu', 'Uganda', 'Peru', 'Lithuania', 'Costa_Rica', 'Netherlands', 'United_States', 'Nicaragua', 'Indonesia', 'Morocco', 'Myanmar', 'Cambodia', 'Poland', 'Liberia', 'Hong_Kong', 'Turkey', 'Azerbaijan', 'Lebanon', 'Tajikistan', 'Spain', 'Australia', 'Ethiopia', 'Jamaica', 'Zaire', 'Hungary', 'Central_African_Republic', 'Niger', 'Bolivia', 'Yugoslavia', 'Angola', 'Nepal', 'Vietnam', 'Bulgaria', 'Sri_Lanka', 'Kyrgyzstan', 'French_Guiana', 'Albania', 'Chile', 'Honduras', 'Rwanda', 'Laos', 'Ivory_Coast', 'Venezuela', 'Panama', 'Thailand', 'Japan', 'Austria', 'Pakistan', 'Slovenia', 'Libya', 'South_Korea', 'China', 'Gabon', 'Zambia', 'Mexico', 'Canada', 'Israel', 'Sweden', 'Brazil', 'Syria', 'Ghana', 'Trinidad_and_Tobago', 'Ukraine', 'Italy', 'Moldova', 'Russia', 'Burundi', 'Haiti', 'United_Kingdom', 'Madagascar', 'Croatia'],
    ['Switzerland', 'Macedonia', 'Ireland', 'Georgia', 'Republic_of_the_Congo', 'Sierra_Leone', 'Bahrain', 'Bosnia-Herzegovina', 'France', 'Belgium', 'Yemen', 'Jordan', 'Uruguay', 'Taiwan', 'Algeria', 'Greece', 'Chad', 'Swaziland', 'Guyana', 'Bangladesh', 'Czech_Republic', 'Egypt', 'Guatemala', 'Iraq', 'Germany', 'Malta', 'Paraguay', 'Colombia', 'Macau', 'New_Zealand', 'Senegal', 'Slovak_Republic', 'El_Salvador', 'Philippines', 'Dominican_Republic', 'West_Bank_and_Gaza_Strip', 'Dominica', 'Sudan', 'Tanzania', 'Ecuador', 'Papua_New_Guinea', 'Kenya', 'India', 'Bahamas', 'Kazakhstan', 'Argentina', 'Somalia', 'Cuba', 'Nigeria', 'Afghanistan', 'South_Africa', 'Democratic_Republic_of_the_Congo', 'Uganda', 'Djibouti', 'Peru', 'Lithuania', 'Costa_Rica', 'Netherlands', 'United_States', 'Nicaragua', 'Indonesia', 'Myanmar', 'Cambodia', 'Poland', 'Turkey', 'Azerbaijan', 'Lebanon', 'Tajikistan', 'Spain', 'Australia', 'Ethiopia', 'Jamaica', 'Zaire', 'Hungary', 'Niger', 'Bolivia', 'Yugoslavia', 'Suriname', 'Comoros', 'Angola', 'Nepal', 'Vietnam', 'Kuwait', 'Bulgaria', 'Sri_Lanka', 'Belarus', 'French_Guiana', 'Albania', 'Chile', 'Honduras', 'Rwanda', 'Ivory_Coast', 'Venezuela', 'Panama', 'Thailand', 'Japan', 'Austria', 'Mali', 'Pakistan', 'Slovenia', 'China', 'Gabon', 'Mexico', 'Canada', 'Israel', 'Sweden', 'Brazil', 'Syria', 'Ghana', 'Ukraine', 'Italy', 'Moldova', 'Russia', 'Burundi', 'Latvia', 'Haiti', 'United_Kingdom', 'Madagascar', 'Croatia'],
    ['Chile', 'Switzerland', 'Colombia', 'Macau', 'Rwanda', 'United_States', 'Indonesia', 'Macedonia', 'Ireland', 'Venezuela', 'Senegal', 'Cambodia', 'Poland', 'Georgia', 'Slovak_Republic', 'Turkey', 'Thailand', 'Philippines', 'Japan', 'Austria', 'Lebanon', 'Pakistan', 'Cyprus', 'Tajikistan', 'West_Bank_and_Gaza_Strip', 'Spain', 'Australia', 'Cameroon', 'China', 'Mexico', 'Canada', 'Sierra_Leone', 'Bosnia-Herzegovina', 'France', 'Israel', 'Belgium', 'Tanzania', 'Hungary', 'Yemen', 'Jordan', 'Yugoslavia', 'Ecuador', 'Brazil', 'Algeria', 'Greece', 'Chad', 'Kenya', 'India', 'Swaziland', 'Guyana', 'Syria', 'Bangladesh', 'Italy', 'Egypt', 'Iraq', 'Russia', 'Somalia', 'Burundi', 'Latvia', 'Nigeria', 'Afghanistan', 'South_Africa', 'Haiti', 'Angola', 'Germany', 'United_Kingdom', 'Armenia', 'Bulgaria', 'Democratic_Republic_of_the_Congo', 'Iran', 'Uganda', 'Peru', 'Sri_Lanka', 'Albania'],
    ['Switzerland', 'Macedonia', 'Ireland', 'Georgia', 'Republic_of_the_Congo', 'Sierra_Leone', 'Bosnia-Herzegovina', 'France', 'Belgium', 'Yemen', 'Jordan', 'Algeria', 'Greece', 'Chad', 'Namibia', 'Swaziland', 'Bangladesh', 'Egypt', 'Guatemala', 'Iraq', 'Germany', 'Armenia', 'Iran', 'Mozambique', 'Paraguay', 'Denmark', 'Colombia', 'Senegal', 'Slovak_Republic', 'Philippines', 'Cyprus', 'West_Bank_and_Gaza_Strip', 'Sudan', 'Ecuador', 'India', 'Argentina', 'Somalia', 'Estonia', 'Nigeria', 'Afghanistan', 'South_Africa', 'Democratic_Republic_of_the_Congo', 'Uganda', 'Peru', 'Netherlands', 'United_States', 'Nicaragua', 'Indonesia', 'Myanmar', 'Cambodia', 'Liberia', 'Turkey', 'Lebanon', 'Tajikistan', 'Spain', 'Ethiopia', 'Niger', 'Yugoslavia', 'Solomon_Islands', 'Angola', 'Nepal', 'Bulgaria', 'Sri_Lanka', 'Belarus', 'Fiji', 'Kosovo', 'Kyrgyzstan', 'Albania', 'Chile', 'Uzbekistan', 'Venezuela', 'Panama', 'Thailand', 'Japan', 'Pakistan', 'China', 'Zambia', 'Mexico', 'Canada', 'Israel', 'Sweden', 'Brazil', 'Ukraine', 'Italy', 'Russia', 'Burundi', 'Latvia', 'Haiti', 'United_Kingdom'],
    //2000
    ['Switzerland', 'Guinea', 'Macedonia', 'Georgia', 'Sierra_Leone', 'Bosnia-Herzegovina', 'France', 'Yemen', 'Jordan', 'Algeria', 'Greece', 'Namibia', 'Qatar', 'Bangladesh', 'Guatemala', 'Iraq', 'Germany', 'Armenia', 'Iran', 'Mozambique', 'Paraguay', 'Malaysia', 'Colombia', 'Senegal', 'Slovak_Republic', 'Philippines', 'Saudi_Arabia', 'Cyprus', 'East_Timor', 'West_Bank_and_Gaza_Strip', 'St._Lucia', 'Sudan', 'Tanzania', 'Gambia', 'Ecuador', 'Kenya', 'India', 'Kazakhstan', 'Somalia', 'Belize', 'Nigeria', 'Afghanistan', 'South_Africa', 'Democratic_Republic_of_the_Congo', 'Uganda', 'Peru', 'Netherlands', 'United_States', 'Nicaragua', 'Indonesia', 'Zimbabwe', 'Cambodia', 'Liberia', 'Hong_Kong', 'Turkey', 'Azerbaijan', 'Lebanon', 'Tajikistan', 'Spain', 'Australia', 'Ethiopia', 'Central_African_Republic', 'Yugoslavia', 'Solomon_Islands', 'Angola', 'Nepal', 'Bulgaria', 'Sri_Lanka', 'Fiji', 'Kosovo', 'Kyrgyzstan', 'Albania', 'Chile', 'Rwanda', 'Laos', 'Ivory_Coast', 'Panama', 'Tunisia', 'Thailand', 'Japan', 'Pakistan', 'Slovenia', 'China', 'Zambia', 'Mexico', 'Canada', 'Israel', 'Sweden', 'Brazil', 'Ukraine', 'Italy', 'Moldova', 'Russia', 'Burundi', 'Latvia', 'Haiti', 'United_Kingdom', 'Croatia'],
    ['Switzerland', 'Macedonia', 'Ireland', 'Georgia', 'Republic_of_the_Congo', 'Bosnia-Herzegovina', 'France', 'Yemen', 'Jordan', 'Taiwan', 'Algeria', 'Greece', 'Namibia', 'Guyana', 'Qatar', 'Bangladesh', 'Czech_Republic', 'Guatemala', 'Iraq', 'Germany', 'Armenia', 'Iran', 'Malaysia', 'Colombia', 'Norway', 'New_Zealand', 'Senegal', 'Montenegro', 'Philippines', 'Saudi_Arabia', 'Cyprus', 'West_Bank_and_Gaza_Strip', 'Sudan', 'Tanzania', 'Ecuador', 'Kenya', 'India', 'Kazakhstan', 'Argentina', 'Estonia', 'Somalia', 'Nigeria', 'Afghanistan', 'Democratic_Republic_of_the_Congo', 'Uganda', 'Peru', 'Costa_Rica', 'Netherlands', 'United_States', 'Zimbabwe', 'Indonesia', 'Myanmar', 'Cambodia', 'Poland', 'Liberia', 'Hong_Kong', 'Turkey', 'Azerbaijan', 'Lebanon', 'Tajikistan', 'Spain', 'Australia', 'Hungary', 'Central_African_Republic', 'Yugoslavia', 'Angola', 'Nepal', 'Vietnam', 'Kuwait', 'Bulgaria', 'Sri_Lanka', 'Belarus', 'Fiji', 'Kosovo', 'Kyrgyzstan', 'Albania', 'Guinea-Bissau', 'Chile', 'Rwanda', 'Laos', 'Ivory_Coast', 'Venezuela', 'Tunisia', 'Thailand', 'Japan', 'Pakistan', 'South_Korea', 'China', 'Mexico', 'Israel', 'Brazil', 'Italy', 'Russia', 'Burundi', 'Haiti', 'United_Kingdom', 'Croatia'],
    ['Chile', 'Honduras', 'Netherlands', 'Colombia', 'United_States', 'Zimbabwe', 'Indonesia', 'Ivory_Coast', 'Macedonia', 'Myanmar', 'Senegal', 'Cambodia', 'Tunisia', 'Venezuela', 'Liberia', 'Georgia', 'Turkey', 'Thailand', 'Philippines', 'Saudi_Arabia', 'Japan', 'Azerbaijan', 'Lebanon', 'Pakistan', 'Turkmenistan', 'West_Bank_and_Gaza_Strip', 'Republic_of_the_Congo', 'Spain', 'China', 'Ethiopia', 'Zambia', 'Bosnia-Herzegovina', 'Sudan', 'France', 'Israel', 'Belgium', 'Tanzania', 'Yemen', 'International', 'Jordan', 'Yugoslavia', 'Ecuador', 'Brazil', 'Papua_New_Guinea', 'Algeria', 'Greece', 'Chad', 'Kenya', 'India', 'Guyana', 'Ukraine', 'Bangladesh', 'Italy', 'Iraq', 'Somalia', 'Russia', 'Solomon_Islands', 'Burundi', 'Nigeria', 'Afghanistan', 'South_Africa', 'Haiti', 'Angola', 'Nepal', 'Germany', 'United_Kingdom', 'Kuwait', 'Bulgaria', 'Democratic_Republic_of_the_Congo', 'Malawi', 'Uganda', 'Peru', 'Sri_Lanka', 'Madagascar', 'Kosovo', 'Kyrgyzstan'],
    ['Chile', 'Switzerland', 'Netherlands', 'Colombia', 'United_States', 'Laos', 'Norway', 'Indonesia', 'Macedonia', 'Ireland', 'Morocco', 'Myanmar', 'Cambodia', 'New_Zealand', 'Venezuela', 'Liberia', 'Georgia', 'Turkey', 'Thailand', 'Philippines', 'Saudi_Arabia', 'Japan', 'Lebanon', 'Pakistan', 'East_Timor', 'West_Bank_and_Gaza_Strip', 'Republic_of_the_Congo', 'South_Korea', 'Spain', 'Zimbabwe', 'China', 'Ethiopia', 'Mexico', 'Bahrain', 'Bosnia-Herzegovina', 'France', 'Israel', 'Belgium', 'Yemen', 'Bolivia', 'Ecuador', 'Brazil', 'Algeria', 'Greece', 'Kenya', 'India', 'Argentina', 'Guyana', 'Swaziland', 'Ukraine', 'Bangladesh', 'Italy', 'Czech_Republic', 'Guatemala', 'Iraq', 'Russia', 'Solomon_Islands', 'Burundi', 'Nigeria', 'Somalia', 'Afghanistan', 'Haiti', 'Nepal', 'Germany', 'United_Kingdom', 'Kuwait', 'Democratic_Republic_of_the_Congo', 'Iran', 'Uganda', 'Peru', 'Sri_Lanka', 'Kosovo', 'Kyrgyzstan', 'Serbia-Montenegro', 'Albania', 'Guinea-Bissau'],
    ['Honduras', 'Netherlands', 'Colombia', 'United_States', 'Uzbekistan', 'Indonesia', 'Ivory_Coast', 'Myanmar', 'Georgia', 'Turkey', 'Thailand', 'Philippines', 'Saudi_Arabia', 'Pakistan', 'Lebanon', 'Cyprus', 'West_Bank_and_Gaza_Strip', 'Spain', 'China', 'Ethiopia', 'Mexico', 'Canada', 'Sudan', 'France', 'Israel', 'Tanzania', 'Taiwan', 'Ecuador', 'Algeria', 'Greece', 'India', 'Syria', 'Bangladesh', 'Italy', 'Guatemala', 'Egypt', 'Iraq', 'Russia', 'Somalia', 'Burundi', 'Nigeria', 'Afghanistan', 'Haiti', 'Mauritania', 'Nepal', 'Germany', 'United_Kingdom', 'Democratic_Republic_of_the_Congo', 'Uganda', 'Djibouti', 'Peru', 'Sri_Lanka', 'Kosovo', 'Serbia-Montenegro'],
    ['Colombia', 'Guinea', 'Rwanda', 'United_States', 'Indonesia', 'Ivory_Coast', 'Myanmar', 'Uzbekistan', 'Senegal', 'Georgia', 'Hong_Kong', 'Turkey', 'Thailand', 'Philippines', 'Saudi_Arabia', 'Mali', 'Lebanon', 'Pakistan', 'Tajikistan', 'East_Timor', 'West_Bank_and_Gaza_Strip', 'Spain', 'China', 'Ethiopia', 'Mexico', 'Bosnia-Herzegovina', 'Sudan', 'France', 'Israel', 'Sweden', 'Togo', 'Yemen', 'Jordan', 'Bolivia', 'Uruguay', 'Algeria', 'Greece', 'Kenya', 'India', 'Argentina', 'Trinidad_and_Tobago', 'Qatar', 'Bangladesh', 'Italy', 'Egypt', 'Iraq', 'Russia', 'Somalia', 'Burundi', 'Nigeria', 'Afghanistan', 'Haiti', 'Mauritania', 'Nepal', 'Germany', 'United_Kingdom', 'Kuwait', 'Democratic_Republic_of_the_Congo', 'Iran', 'Uganda', 'Peru', 'Sri_Lanka', 'Croatia', 'Kosovo', 'Kyrgyzstan', 'Serbia-Montenegro', 'Guinea-Bissau'],
    ['Chile', 'Colombia', 'United_States', 'Norway', 'Zimbabwe', 'Indonesia', 'Ivory_Coast', 'Ireland', 'Macedonia', 'Myanmar', 'Georgia', 'Turkey', 'Thailand', 'Philippines', 'Saudi_Arabia', 'Pakistan', 'Austria', 'Lebanon', 'West_Bank_and_Gaza_Strip', 'South_Korea', 'Australia', 'Spain', 'Bhutan', 'Ethiopia', 'Maldives', 'Canada', 'Mexico', 'Bahrain', 'Bosnia-Herzegovina', 'France', 'Israel', 'Sudan', 'Sweden', 'Lesotho', 'Central_African_Republic', 'Yemen', 'Jordan', 'Brazil', 'Algeria', 'Greece', 'Chad', 'Kenya', 'India', 'Swaziland', 'Guyana', 'Syria', 'Bangladesh', 'Italy', 'Egypt', 'Guatemala', 'Iraq', 'Moldova', 'Russia', 'Burundi', 'Nigeria', 'Somalia', 'Afghanistan', 'Haiti', 'Nepal', 'Germany', 'United_Kingdom', 'Democratic_Republic_of_the_Congo', 'Iran', 'Peru', 'Belarus', 'Madagascar', 'Sri_Lanka', 'Kosovo', 'Kyrgyzstan', 'Serbia-Montenegro', 'Guinea-Bissau'],
    ['Switzerland', 'Macedonia', 'Ireland', 'Cameroon', 'Bosnia-Herzegovina', 'France', 'Belgium', 'Yemen', 'Algeria', 'Greece', 'Chad', 'Bangladesh', 'Iraq', 'Eritrea', 'Germany', 'Armenia', 'Iran', 'Mozambique', 'Finland', 'Benin', 'Colombia', 'Senegal', 'Montenegro', 'Philippines', 'Saudi_Arabia', 'Cyprus', 'East_Timor', 'West_Bank_and_Gaza_Strip', 'Sudan', 'Papua_New_Guinea', 'Kenya', 'India', 'Western_Sahara', 'Somalia', 'Cuba', 'Nigeria', 'Afghanistan', 'South_Africa', 'Democratic_Republic_of_the_Congo', 'Uganda', 'Peru', 'United_States', 'Zimbabwe', 'Indonesia', 'Morocco', 'Myanmar', 'Turkey', 'Azerbaijan', 'Lebanon', 'Tajikistan', 'Spain', 'Ethiopia', 'Jamaica', 'Maldives', 'Central_African_Republic', 'Niger', 'Bolivia', 'Nepal', 'Sri_Lanka', 'Kosovo', 'Kyrgyzstan', 'Chile', 'Ivory_Coast', 'Venezuela', 'Tunisia', 'Thailand', 'Mali', 'Austria', 'Pakistan', 'Libya', 'Mexico', 'Israel', 'Ukraine', 'Russia', 'Burundi', 'Latvia', 'Haiti', 'United_Kingdom'],
    ['Macedonia', 'Ireland', 'Georgia', 'Cameroon', 'Bahrain', 'Bosnia-Herzegovina', 'France', 'Yemen', 'Taiwan', 'Algeria', 'Greece', 'Chad', 'Swaziland', 'Guyana', 'Bangladesh', 'Czech_Republic', 'Egypt', 'Iraq', 'Eritrea', 'Germany', 'Iran', 'Denmark', 'Finland', 'Malaysia', 'Colombia', 'New_Zealand', 'Senegal', 'Philippines', 'East_Timor', 'West_Bank_and_Gaza_Strip', 'Sudan', 'Tanzania', 'Ecuador', 'Kenya', 'India', 'Kazakhstan', 'Somalia', 'Nigeria', 'Afghanistan', 'South_Africa', 'Mauritania', 'Democratic_Republic_of_the_Congo', 'Uganda', 'Peru', 'Netherlands', 'United_States', 'Zimbabwe', 'Indonesia', 'Myanmar', 'Cambodia', 'Liberia', 'Serbia', 'Hong_Kong', 'Turkey', 'Azerbaijan', 'Lebanon', 'Spain', 'Australia', 'Bhutan', 'Ethiopia', 'Maldives', 'Hungary', 'Central_African_Republic', 'Niger', 'Nepal', 'Bulgaria', 'Sri_Lanka', 'Belarus', 'Kosovo', 'Chile', 'Rwanda', 'Venezuela', 'Tunisia', 'Thailand', 'Japan', 'Austria', 'Mali', 'Pakistan', 'Libya', 'China', 'Mexico', 'Canada', 'Israel', 'Sweden', 'Syria', 'Ukraine', 'Italy', 'Romania', 'Russia', 'Burundi', 'United_Kingdom', 'Croatia'],
    ['Macedonia', 'Georgia', 'Cameroon', 'Bosnia-Herzegovina', 'France', 'Belgium', 'Yemen', 'Algeria', 'Greece', 'Chad', 'Bangladesh', 'Czech_Republic', 'Egypt', 'Iraq', 'Eritrea', 'Germany', 'Armenia', 'Iran', 'Malaysia', 'Colombia', 'Senegal', 'Philippines', 'Saudi_Arabia', 'West_Bank_and_Gaza_Strip', 'Sudan', 'Ecuador', 'Kenya', 'India', 'Argentina', 'Somalia', 'Nigeria', 'Afghanistan', 'Mauritania', 'Democratic_Republic_of_the_Congo', 'Uganda', 'Peru', 'Netherlands', 'United_States', 'Equatorial_Guinea', 'Indonesia', 'Myanmar', 'Serbia', 'Turkey', 'Azerbaijan', 'Lebanon', 'Tajikistan', 'Spain', 'Australia', 'Ethiopia', 'Hungary', 'Central_African_Republic', 'Lesotho', 'Niger', 'Bolivia', 'Angola', 'Nepal', 'Sri_Lanka', 'Kosovo', 'Albania', 'Guinea-Bissau', 'Chile', 'Honduras', 'Rwanda', 'Uzbekistan', 'Venezuela', 'Panama', 'Thailand', 'Japan', 'Austria', 'Mali', 'Pakistan', 'China', 'Mexico', 'Canada', 'Israel', 'Sweden', 'Ukraine', 'Italy', 'Moldova', 'Russia', 'United_Kingdom', 'Madagascar', 'Croatia'],
    //2010
    ['Chile', 'Netherlands', 'Colombia', 'Rwanda', 'Norway', 'United_States', 'Indonesia', 'Ivory_Coast', 'Ireland', 'Myanmar', 'Senegal', 'Zimbabwe', 'Poland', 'Georgia', 'Serbia', 'Turkey', 'Thailand', 'Philippines', 'Mali', 'Lebanon', 'Pakistan', 'Tajikistan', 'West_Bank_and_Gaza_Strip', 'Spain', 'Australia', 'Cameroon', 'China', 'Ethiopia', 'Mexico', 'Canada', 'Bahrain', 'Bosnia-Herzegovina', 'France', 'Israel', 'Sudan', 'Sweden', 'Tanzania', 'Central_African_Republic', 'Yemen', 'Niger', 'Jordan', 'Algeria', 'United_Arab_Emirates', 'Greece', 'Chad', 'Kenya', 'India', 'Argentina', 'Trinidad_and_Tobago', 'Ukraine', 'Bangladesh', 'Italy', 'Egypt', 'Iraq', 'Russia', 'Somalia', 'Burundi', 'Eritrea', 'Nigeria', 'Afghanistan', 'Mauritania', 'Angola', 'Nepal', 'Germany', 'United_Kingdom', 'Democratic_Republic_of_the_Congo', 'Iran', 'Uganda', 'Sri_Lanka', 'Belarus', 'Paraguay', 'Denmark', 'Kosovo', 'Kyrgyzstan'],
    ['Chile', 'Honduras', 'Switzerland', 'Netherlands', 'Colombia', 'Rwanda', 'Norway', 'United_States', 'Indonesia', 'Ivory_Coast', 'Ireland', 'Morocco', 'Myanmar', 'Senegal', 'Tunisia', 'Zimbabwe', 'Georgia', 'Turkey', 'Thailand', 'Philippines', 'Saudi_Arabia', 'Mali', 'Austria', 'Lebanon', 'Pakistan', 'West_Bank_and_Gaza_Strip', 'Libya', 'Cameroon', 'Bhutan', 'China', 'Ethiopia', 'Mexico', 'Bahrain', 'Bosnia-Herzegovina', 'France', 'Israel', 'Sudan', 'Sweden', 'Central_African_Republic', 'Yemen', 'Niger', 'Ecuador', 'Algeria', 'Greece', 'Kenya', 'India', 'Kazakhstan', 'Argentina', 'Syria', 'Portugal', 'Bangladesh', 'Italy', 'Ukraine', 'Czech_Republic', 'Egypt', 'Estonia', 'Iraq', 'Russia', 'Burundi', 'Eritrea', 'Nigeria', 'Afghanistan', 'Somalia', 'Mauritania', 'Nepal', 'Germany', 'United_Kingdom', 'Kuwait', 'Bulgaria', 'Democratic_Republic_of_the_Congo', 'Iran', 'Belarus', 'Madagascar', 'Paraguay', 'Kosovo', 'Kyrgyzstan'],
    ['Macedonia', 'Ireland', 'Georgia', 'Bahrain', 'France', 'Belgium', 'Yemen', 'Jordan', 'Algeria', 'Greece', 'Bangladesh', 'Egypt', 'Guatemala', 'Iraq', 'Germany', 'Iran', 'Mozambique', 'Paraguay', 'Malaysia', 'Colombia', 'Senegal', 'Iceland', 'Philippines', 'Saudi_Arabia', 'Cyprus', 'West_Bank_and_Gaza_Strip', 'Sudan', 'Ecuador', 'Kenya', 'India', 'Kazakhstan', 'Argentina', 'Somalia', 'Nigeria', 'Afghanistan', 'South_Africa', 'Democratic_Republic_of_the_Congo', 'Uganda', 'Peru', 'South_Sudan', 'United_States', 'Indonesia', 'Myanmar', 'Liberia', 'Serbia', 'Turkey', 'Lebanon', 'Tajikistan', 'Spain', 'Ethiopia', 'Maldives', 'Central_African_Republic', 'Niger', 'Bolivia', 'Nepal', 'Bulgaria', 'Sri_Lanka', 'Belarus', 'Kosovo', 'Guinea-Bissau', 'Chile', 'Rwanda', 'Laos', 'Ivory_Coast', 'Venezuela', 'Tunisia', 'Thailand', 'Mali', 'Pakistan', 'Libya', 'China', 'Mexico', 'Canada', 'Israel', 'Sweden', 'Brazil', 'Syria', 'Ukraine', 'Italy', 'Moldova', 'Russia', 'Burundi', 'United_Kingdom', 'Madagascar'],
    ['Switzerland', 'Guinea', 'Ireland', 'Georgia', 'Republic_of_the_Congo', 'Cameroon', 'Bahrain', 'Bosnia-Herzegovina', 'France', 'Yemen', 'Jordan', 'Taiwan', 'Algeria', 'Greece', 'Bangladesh', 'Czech_Republic', 'Egypt', 'Guatemala', 'Iraq', 'Armenia', 'Iran', 'Mozambique', 'Paraguay', 'Denmark', 'Malaysia', 'Colombia', 'Senegal', 'Montenegro', 'Burkina_Faso', 'Philippines', 'Saudi_Arabia', 'Dominican_Republic', 'Cyprus', 'West_Bank_and_Gaza_Strip', 'Sudan', 'Tanzania', 'Ecuador', 'Kenya', 'India', 'Bahamas', 'Kazakhstan', 'Argentina', 'Belize', 'Somalia', 'Nigeria', 'Afghanistan', 'South_Africa', 'Democratic_Republic_of_the_Congo', 'Peru', 'South_Sudan', 'United_States', 'Zimbabwe', 'Indonesia', 'Myanmar', 'Cambodia', 'Turkey', 'Lebanon', 'Spain', 'Australia', 'Ethiopia', 'Maldives', 'Central_African_Republic', 'Niger', 'United_Arab_Emirates', 'Nepal', 'Bulgaria', 'Sri_Lanka', 'Kosovo', 'Albania', 'Chile', 'Honduras', 'Rwanda', 'Ivory_Coast', 'Venezuela', 'Tunisia', 'Thailand', 'Japan', 'Austria', 'Mali', 'Pakistan', 'Libya', 'China', 'Mexico', 'Canada', 'Israel', 'Brazil', 'Syria', 'Trinidad_and_Tobago', 'Ukraine', 'Italy', 'Russia', 'Burundi', 'United_Kingdom', 'Madagascar', 'Croatia'],
    ['Macedonia', 'Ireland', 'Georgia', 'Cameroon', 'Bahrain', 'Bosnia-Herzegovina', 'France', 'Belgium', 'Yemen', 'Jordan', 'Taiwan', 'Algeria', 'Greece', 'Chad', 'Bangladesh', 'Czech_Republic', 'Egypt', 'Iraq', 'Germany', 'Iran', 'Malta', 'Mozambique', 'Paraguay', 'Malaysia', 'Colombia', 'New_Zealand', 'Senegal', 'Iceland', 'Philippines', 'Saudi_Arabia', 'Cyprus', 'West_Bank_and_Gaza_Strip', 'Sudan', 'Tanzania', 'Kenya', 'India', 'Argentina', 'Somalia', 'Nigeria', 'Afghanistan', 'South_Africa', 'Democratic_Republic_of_the_Congo', 'Uganda', 'Djibouti', 'Peru', 'South_Sudan', 'Netherlands', 'United_States', 'Nicaragua', 'Indonesia', 'Myanmar', 'Zimbabwe', 'Liberia', 'Turkey', 'Azerbaijan', 'Lebanon', 'Tajikistan', 'Spain', 'Australia', 'Bhutan', 'Ethiopia', 'Jamaica', 'Maldives', 'Hungary', 'Central_African_Republic', 'Niger', 'United_Arab_Emirates', 'Nepal', 'Bulgaria', 'Sri_Lanka', 'Kosovo', 'Kyrgyzstan', 'Albania', 'Chile', 'Honduras', 'Rwanda', 'Ivory_Coast', 'Venezuela', 'Tunisia', 'Thailand', 'Japan', 'Mali', 'Pakistan', 'Turkmenistan', 'Libya', 'China', 'Mexico', 'Canada', 'Israel', 'Sweden', 'Brazil', 'Syria', 'Ghana', 'Ukraine', 'Italy', 'Russia', 'Burundi', 'United_Kingdom', 'Madagascar'],
    ['Guinea', 'Macedonia', 'Ireland', 'Georgia', 'Cameroon', 'Bahrain', 'Bosnia-Herzegovina', 'France', 'Yemen', 'Jordan', 'Algeria', 'Greece', 'Chad', 'Qatar', 'Bangladesh', 'Czech_Republic', 'Egypt', 'Iraq', 'Germany', 'Armenia', 'Iran', 'Malta', 'Mozambique', 'Paraguay', 'Denmark', 'Finland', 'Malaysia', 'Colombia', 'Senegal', 'Montenegro', 'Burkina_Faso', 'Philippines', 'Saudi_Arabia', 'West_Bank_and_Gaza_Strip', 'Sudan', 'Tanzania', 'Ecuador', 'Kenya', 'India', 'Argentina', 'Estonia', 'Somalia', 'Nigeria', 'Afghanistan', 'South_Africa', 'Democratic_Republic_of_the_Congo', 'Uganda', 'Djibouti', 'Peru', 'South_Sudan', 'Netherlands', 'United_States', 'Indonesia', 'Morocco', 'Myanmar', 'Turkey', 'Lebanon', 'Tajikistan', 'Spain', 'Australia', 'Ethiopia', 'Maldives', 'Hungary', 'Central_African_Republic', 'Lesotho', 'Niger', 'Nepal', 'Kuwait', 'Bulgaria', 'Sri_Lanka', 'Kosovo', 'Kyrgyzstan', 'Albania', 'Chile', 'Uzbekistan', 'Laos', 'Ivory_Coast', 'Venezuela', 'Tunisia', 'Thailand', 'Japan', 'Mali', 'Pakistan', 'Libya', 'South_Korea', 'China', 'Mexico', 'Canada', 'Israel', 'Sweden', 'Brazil', 'Syria', 'Trinidad_and_Tobago', 'Ukraine', 'Italy', 'Russia', 'Burundi', 'United_Kingdom'],
    ['Switzerland', 'Guinea', 'Ireland', 'Georgia', 'Republic_of_the_Congo', 'Cameroon', 'Sierra_Leone', 'Bahrain', 'France', 'Belgium', 'Yemen', 'Jordan', 'Uruguay', 'Taiwan', 'Algeria', 'Greece', 'Chad', 'Guyana', 'Bangladesh', 'Czech_Republic', 'Egypt', 'Iraq', 'Germany', 'Armenia', 'Iran', 'Mozambique', 'Paraguay', 'Denmark', 'Finland', 'Malaysia', 'Colombia', 'New_Zealand', 'Burkina_Faso', 'Slovak_Republic', 'Philippines', 'Saudi_Arabia', 'Cyprus', 'West_Bank_and_Gaza_Strip', 'Sudan', 'Tanzania', 'Ecuador', 'Kenya', 'India', 'Kazakhstan', 'Argentina', 'Somalia', 'Nigeria', 'Afghanistan', 'South_Africa', 'Democratic_Republic_of_the_Congo', 'Uganda', 'Peru', 'South_Sudan', 'Netherlands', 'United_States', 'Indonesia', 'Myanmar', 'Poland', 'Turkey', 'Azerbaijan', 'Lebanon', 'Tajikistan', 'Spain', 'Australia', 'Ethiopia', 'Maldives', 'Hungary', 'Central_African_Republic', 'Niger', 'Angola', 'Nepal', 'Kuwait', 'Bulgaria', 'Sri_Lanka', 'Kosovo', 'Kyrgyzstan', 'Albania', 'Chile', 'Honduras', 'Rwanda', 'Laos', 'Ivory_Coast', 'Venezuela', 'Panama', 'Tunisia', 'Thailand', 'Japan', 'Austria', 'Mali', 'Pakistan', 'Libya', 'South_Korea', 'China', 'Mexico', 'Canada', 'Israel', 'Sweden', 'Brazil', 'Syria', 'Ghana', 'Ukraine', 'Italy', 'Moldova', 'Russia', 'Burundi', 'Haiti', 'United_Kingdom', 'Madagascar'],
    ['Macedonia', 'Ireland', 'Georgia', 'Cameroon', 'Sierra_Leone', 'Bahrain', 'France', 'Belgium', 'Yemen', 'Jordan', 'Taiwan', 'Algeria', 'Greece', 'Chad', 'Bangladesh', 'Czech_Republic', 'Egypt', 'Iraq', 'Germany', 'Malawi', 'Iran', 'Malta', 'Mozambique', 'Paraguay', 'Finland', 'Malaysia', 'Colombia', 'Norway', 'Burkina_Faso', 'Philippines', 'Saudi_Arabia', 'Dominican_Republic', 'West_Bank_and_Gaza_Strip', 'Sudan', 'Tanzania', 'Ecuador', 'Papua_New_Guinea', 'Kenya', 'India', 'Argentina', 'Somalia', 'Nigeria', 'Afghanistan', 'South_Africa', 'Democratic_Republic_of_the_Congo', 'Uganda', 'Djibouti', 'Peru', 'South_Sudan', 'Netherlands', 'United_States', 'Zimbabwe', 'Indonesia', 'Myanmar', 'Poland', 'Liberia', 'Serbia', 'Turkey', 'Azerbaijan', 'Lebanon', 'Tajikistan', 'Spain', 'Australia', 'Ethiopia', 'Jamaica', 'Maldives', 'Central_African_Republic', 'Niger', 'Angola', 'Nepal', 'Vietnam', 'Sri_Lanka', 'Kosovo', 'Kyrgyzstan', 'Albania', 'Chile', 'Honduras', 'Rwanda', 'Laos', 'Ivory_Coast', 'Venezuela', 'Tunisia', 'Thailand', 'Mali', 'Austria', 'Pakistan', 'Libya', 'China', 'Gabon', 'Zambia', 'Mexico', 'Canada', 'Israel', 'Sweden', 'Brazil', 'Syria', 'Ukraine', 'Italy', 'Russia', 'Burundi', 'Latvia', 'United_Kingdom', 'New_Caledonia'],
    ['Switzerland', 'Guinea', 'Ireland', 'Georgia', 'Cameroon', 'Bahrain', 'Bosnia-Herzegovina', 'France', 'Belgium', 'Yemen', 'Jordan', 'Taiwan', 'Algeria', 'Greece', 'Chad', 'Bangladesh', 'Egypt', 'Guatemala', 'Iraq', 'Germany', 'Armenia', 'Malawi', 'Iran', 'Mozambique', 'Paraguay', 'Denmark', 'Finland', 'Malaysia', 'Colombia', 'Senegal', 'Montenegro', 'Burkina_Faso', 'Slovak_Republic', 'Philippines', 'Saudi_Arabia', 'West_Bank_and_Gaza_Strip', 'Sudan', 'Tanzania', 'Ecuador', 'Kenya', 'India', 'Argentina', 'Western_Sahara', 'Somalia', 'Nigeria', 'Afghanistan', 'South_Africa', 'Mauritania', 'Democratic_Republic_of_the_Congo', 'Uganda', 'Peru', 'South_Sudan', 'Lithuania', 'Netherlands', 'United_States', 'Nicaragua', 'Indonesia', 'Morocco', 'Myanmar', 'Zimbabwe', 'Cambodia', 'Poland', 'Serbia', 'Turkey', 'Azerbaijan', 'Lebanon', 'Tajikistan', 'Spain', 'Australia', 'Ethiopia', 'Maldives', 'Central_African_Republic', 'Niger', 'Bolivia', 'Comoros', 'Nepal', 'Vietnam', 'Bulgaria', 'Sri_Lanka', 'Kosovo', 'Kyrgyzstan', 'Chile', 'Rwanda', 'Ivory_Coast', 'Venezuela', 'Tunisia', 'Thailand', 'Japan', 'Austria', 'Mali', 'Pakistan', 'Libya', 'South_Korea', 'China', 'Mexico', 'Canada', 'Israel', 'Sweden', 'Brazil', 'Syria', 'Ghana', 'Trinidad_and_Tobago', 'Ukraine', 'Italy', 'Russia', 'Burundi', 'Haiti', 'United_Kingdom', 'New_Caledonia'],
    ['Switzerland', 'Ireland', 'Cameroon', 'France', 'Belgium', 'Yemen', 'Jordan', 'Taiwan', 'Greece', 'Chad', 'Guyana', 'Bangladesh', 'Egypt', 'Iraq', 'Germany', 'Malawi', 'Iran', 'Mozambique', 'Denmark', 'Finland', 'Malaysia', 'Benin', 'Colombia', 'Norway', 'New_Zealand', 'Senegal', 'Burkina_Faso', 'Philippines', 'Saudi_Arabia', 'West_Bank_and_Gaza_Strip', 'Sudan', 'Tanzania', 'Ecuador', 'Kenya', 'India', 'Kazakhstan', 'Argentina', 'Somalia', 'Nigeria', 'Afghanistan', 'South_Africa', 'Democratic_Republic_of_the_Congo', 'Uganda', 'Peru', 'South_Sudan', 'Lithuania', 'Costa_Rica', 'Netherlands', 'United_States', 'Nicaragua', 'Indonesia', 'Myanmar', 'Zimbabwe', 'Liberia', 'Turkey', 'Lebanon', 'Tajikistan', 'Spain', 'Australia', 'Ethiopia', 'Maldives', 'Hungary', 'Central_African_Republic', 'Niger', 'Bolivia', 'Comoros', 'Angola', 'Nepal', 'Sri_Lanka', 'Albania', 'Chile', 'Honduras', 'Rwanda', 'Ivory_Coast', 'Venezuela', 'Tunisia', 'Thailand', 'Japan', 'Mali', 'Pakistan', 'Libya', 'South_Korea', 'China', 'Gabon', 'Mexico', 'Canada', 'Israel', 'Sweden', 'Brazil', 'Syria', 'Ghana', 'Trinidad_and_Tobago', 'Ukraine', 'Italy', 'Russia', 'Burundi', 'Haiti', 'United_Kingdom', 'New_Caledonia'],
    //2020
    ['Switzerland', 'Ireland', 'Georgia', 'Cameroon', 'France', 'Belgium', 'Yemen', 'Algeria', 'Greece', 'Chad', 'Guyana', 'Portugal', 'Bangladesh', 'Egypt', 'Guatemala', 'Iraq', 'Eritrea', 'Germany', 'Iran', 'Mozambique', 'Paraguay', 'Finland', 'Malaysia', 'Benin', 'Colombia', 'Norway', 'New_Zealand', 'Burkina_Faso', 'Philippines', 'Saudi_Arabia', 'Cyprus', 'West_Bank_and_Gaza_Strip', 'Dominica', 'St._Lucia', 'Sudan', 'Tanzania', 'Ecuador', 'Kenya', 'India', 'Kazakhstan', 'Argentina', 'Somalia', 'Nigeria', 'Afghanistan', 'South_Africa', 'Democratic_Republic_of_the_Congo', 'Uganda', 'Peru', 'South_Sudan', 'Netherlands', 'United_States', 'Nicaragua', 'Indonesia', 'Myanmar', 'Zimbabwe', 'Cambodia', 'Poland', 'Turkey', 'Lebanon', 'Australia', 'Ethiopia', 'Maldives', 'Central_African_Republic', 'Niger', 'Bolivia', 'Angola', 'Nepal', 'Bulgaria', 'Sri_Lanka', 'Belarus', 'Kosovo', 'Kyrgyzstan', 'Albania', 'Chile', 'Honduras', 'Rwanda', 'Ivory_Coast', 'Venezuela', 'Tunisia', 'Thailand', 'Mali', 'Austria', 'Pakistan', 'Libya', 'China', 'Mexico', 'Canada', 'Israel', 'Sweden', 'Brazil', 'Syria', 'Ghana', 'Trinidad_and_Tobago', 'Ukraine', 'Italy', 'Russia', 'Burundi', 'Haiti', 'United_Kingdom', 'Croatia', 'New_Caledonia'],
    ['Switzerland', 'Ireland', 'Cameroon', 'France', 'Belgium', 'Yemen', 'Algeria', 'Greece', 'Chad', 'Bangladesh', 'Egypt', 'Guatemala', 'Iraq', 'Germany', 'Iran', 'Mozambique', 'Paraguay', 'Benin', 'Colombia', 'Burkina_Faso', 'El_Salvador', 'Philippines', 'Saudi_Arabia', 'West_Bank_and_Gaza_Strip', 'Sudan', 'Kenya', 'India', 'Argentina', 'Western_Sahara', 'Estonia', 'Somalia', 'Nigeria', 'Afghanistan', 'South_Africa', 'Democratic_Republic_of_the_Congo', 'Uganda', 'Djibouti', 'Peru', 'South_Sudan', 'Netherlands', 'United_States', 'Indonesia', 'Myanmar', 'Liberia', 'Serbia', 'Turkey', 'Lebanon', 'Spain', 'Australia', 'Ethiopia', 'Maldives', 'Central_African_Republic', 'Niger', 'Nepal', 'Sri_Lanka', 'Kosovo', 'Albania', 'Chile', 'Rwanda', 'Ivory_Coast', 'Venezuela', 'Tunisia', 'Thailand', 'Mali', 'Pakistan', 'Libya', 'China', 'Zambia', 'Mexico', 'Canada', 'Israel', 'Sweden', 'Brazil', 'Syria', 'Ghana', 'Ukraine', 'Italy', 'Burundi', 'Latvia', 'United_Kingdom']
  ]
//定义旋转中心
  const rotatelist=[
    //1970
    [-100,40,0],[-100,40,0],
    //1972
    [-3.44,55.38,0],[-3.44, 55.38,0],[-3.44, 55.38,0],[-3.44, 55.38,0],[-3.44, 55.38,0],
    //1977
    [12.57,41.87,0],[12.57,41.87,0],
    //1979
    [-88.90,13.79,0],[-88.90,13.79,0],[-88.90,13.79,0],[-88.90,13.79,0],
    //1983
    [-75.02,-9.19,0],[-75.02,-9.19,0],
    //1985
    [-88.90,13.79,0],
    //1986
    [-75.02,-9.19,0],[-75.02,-9.19,0],
    //1988
    [69,34,0],
    //1989
    [-75.02,-9.19,0],[-75.02,-9.19,0],[-75.02,-9.19,0],
    //1992
    [-74.30,4.57,0],[-74.30,4.57,0],
    //1994
    [73,33,0],
    //1995
    [139,35,0],
    //1996
    [-79,6,0],
    //1997
    [-74.30,4.57,0],
    //1998
    [36,-1,0],
    //1999
    [-74.30,4.57,0],
    //2000
    [78.96,20.59,0],
    //2001
    [-74,40,0],
    //2002
    [78.96,20.59,0],
    //2003
    [44,33,0],
    //2004
    [44,43,0],
    //2005
    [44,33,0],[44,33,0],[44,33,0],[44,33,0],[44,33,0],[44,33,0],
    //2011
    [36,43,0],
    //2012
    [69.35,30.38,0],
    //2013 伊拉克
    [44,33,0],[44,33,0],[44,33,0],[44,33,0],[44,33,0],
    //2018
    [67.71,33.94,0],[67.71,33.94,0],[67.71,33.94,0],[67.71,33.94,0]
  ]

//不高亮区域覆盖灰色
  function greyCountry() {
    svg.select('.countries').selectAll('path').attr('fill','rgb(220, 220, 220)');
  }

//高亮区域变为粉色
  function highlightCountry(countryName, color) {
    svg.select(".country_" + countryName)
        .attr("fill", color);
  }


  let pointmap = svg.append("g")
  $(window).scroll(function () {
    let viewLine = $(window).scrollTop() + $(window).height() / 20,
        active = -1;

    if (scrollTarget === false) {
      milestones.each(function () {
        if ($(this).offset().top - 300 - viewLine > 0) {
          return false;
        }
        active++;
      });
    } else {
      active = scrollTarget;
    }

    timeline.css('top', -1 * active * TIMELINE_VALUES.step + TIMELINE_VALUES.start + 'px');

    items.filter('.active').removeClass('active');

    items.eq(active != -1 ? active : 0).addClass('active');

    greyCountry(); //其他区域改为灰色
    country_list[active].forEach(e => {
      highlightCountry(e,'#dbb6b6')  //高亮粉色
    });
    changeto(rotatelist[active],active+1);
  }).trigger('scroll');


});