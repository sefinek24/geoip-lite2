'use strict';const{name:e,version:t}=require('../package.json'),n=`Mozilla/5.0 (compatible; ${e}/${t}; +https://sefinek.net)`,o=require('node:fs'),r=require('node:http'),i=require('node:https'),s=require('node:path'),c=require('node:url'),l=require('node:zlib');o.existsSync=o.existsSync||s.existsSync;const a=require('async'),u=require('chalk'),d=require('iconv-lite'),p=require('lazy'),f=require('rimraf').sync,g=require('adm-zip'),m=require('../lib/utils.js'),{Address6:h,Address4:w}=require('ip-address'),y=process.argv.slice(2);let S=y.find((function(e){return null!==e.match(/^license_key=[a-zA-Z0-9]+/)}));void 0===S&&void 0!==process.env.LICENSE_KEY&&(S='license_key='+process.env.LICENSE_KEY);let v=y.find((function(e){return null!==e.match(/^geoDataDir=[\w./]+/)}));void 0===v&&void 0!==process.env.GEODATADIR&&(v='geoDataDir='+process.env.GEODATADIR);let x=s.resolve(__dirname,'..','data');void 0!==v&&(x=s.resolve(process.cwd(),v.split('=')[1]),o.existsSync(x)||(console.log(u.red('ERROR')+': Directory doesn\'t exist: '+x),process.exit(1)));const E=s.resolve(__dirname,'..','tmp'),k={},I={},D=[{type:'country',url:'https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-Country-CSV&suffix=zip&'+S,checksum:'https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-Country-CSV&suffix=zip.sha256&'+S,fileName:'GeoLite2-Country-CSV.zip',src:['GeoLite2-Country-Locations-en.csv','GeoLite2-Country-Blocks-IPv4.csv','GeoLite2-Country-Blocks-IPv6.csv'],dest:['','geoip-country.dat','geoip-country6.dat']},{type:'city',url:'https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-City-CSV&suffix=zip&'+S,checksum:'https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-City-CSV&suffix=zip.sha256&'+S,fileName:'GeoLite2-City-CSV.zip',src:['GeoLite2-City-Locations-en.csv','GeoLite2-City-Blocks-IPv4.csv','GeoLite2-City-Blocks-IPv6.csv'],dest:['geoip-city-names.dat','geoip-city.dat','geoip-city6.dat']}];function C(e){const t=s.dirname(e);o.existsSync(t)||o.mkdirSync(t)}function R(e){const t=/^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;if(!t.test(e)&&(e=function(e){let t=0,n=-1;for(e=e.replace(/""/,'\\"').replace(/'/g,'\\\'');t<e.length&&n<e.length;)t=n,n=e.indexOf(',',t+1),n<0&&(n=e.length),e.indexOf('\'',t||0)>-1&&e.indexOf('\'',t)<n&&'"'!=e[t+1]&&'"'!=e[n-1]&&(n=(e=e.substr(0,t+1)+'"'+e.substr(t+1,n-t-1)+'"'+e.substr(n,e.length-n)).indexOf(',',n+1),n<0&&(n=e.length));return e}(e),!t.test(e)))return null;const n=[];return e.replace(/(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g,(function(e,t,o,r){return void 0!==t?n.push(t.replace(/\\'/g,'\'')):void 0!==o?n.push(o.replace(/\\"/g,'"').replace(/\\'/g,'\'')):void 0!==r&&n.push(r),''})),/,\s*$/.test(e)&&n.push(''),n}function B(e){const t=c.parse(e);if(t.headers={'User-Agent':n},process.env.http_proxy||process.env.https_proxy)try{const e=require('node:https-proxy-agent');t.agent=new e(process.env.http_proxy||process.env.https_proxy)}catch(e){console.error('Install https-proxy-agent to use an HTTP/HTTPS proxy'),process.exit(-1)}return t}function _(e,t){if(-1!==y.indexOf('force'))return t(null,e);const n=e.checksum;if(void 0===n)return t(null,e);o.readFile(s.join(x,e.type+'.checksum'),{encoding:'utf8'},(function(o,s){!o&&s&&s.length&&(e.checkValue=s),console.log('Checking ',e.fileName);var c=i.get(B(n),(function(n){const o=n.statusCode;200!==o&&(console.log(u.red('ERROR')+n.data),console.log(u.red('ERROR')+': HTTP Request Failed [%d %s]',o,r.STATUS_CODES[o]),c.abort(),process.exit(1));let i='';n.on('data',(function(e){i+=e})),n.on('end',(function(){i&&i.length?i==e.checkValue?(console.log(u.green('Database "'+e.type+'" is up to date')),e.skip=!0):(console.log(u.green('Database '+e.type+' has new data')),e.checkValue=i):(console.log(u.red('ERROR')+': Could not retrieve checksum for',e.type,u.red('Aborting')),console.log('Run with "force" to update without checksum'),c.abort(),process.exit(1)),t(null,e)}))}))}))}function b(e,t){if(e.skip)return t(null,null,null,e);const n=e.url;let c=e.fileName;const a='.gz'===s.extname(c);a&&(c=c.replace('.gz',''));const d=s.join(E,c);if(o.existsSync(d))return t(null,d,c,e);console.log('Fetching ',c),C(d);var p=i.get(B(n),(function(n){const i=n.statusCode;let s;200!==i&&(console.error(u.red('ERROR')+': HTTP Request Failed [%d %s]',i,r.STATUS_CODES[i]),p.abort(),process.exit(1));const f=o.createWriteStream(d);s=a?n.pipe(l.createGunzip()).pipe(f):n.pipe(f),s.on('close',(function(){console.log(u.green(' DONE')),t(null,d,c,e)}))}));process.stdout.write('Retrieving '+c+'...')}function A(e,t,n,r){if(n.skip)return r(null,n);if('.zip'!==s.extname(t))r(null,n);else{process.stdout.write('Extracting '+t+'...');new g(e).getEntries().forEach((e=>{if(e.isDirectory)return;const t=e.entryName.split('/'),n=t[t.length-1],r=s.join(E,n);o.writeFileSync(r,e.getData())})),console.log(u.green(' DONE')),r(null,n)}}function O(e,t,n){let r=0;const i=s.join(x,t),c=s.join(E,e);f(i),C(i),process.stdout.write('Processing data (may take a moment)...');var l=Date.now(),a=o.openSync(i,'w');p(o.createReadStream(c)).lines.map((function(e){return d.decode(e,'latin1')})).skip(1).map((function(e){const t=R(e);if(!t||t.length<6)return void console.warn('weird line: %s::',e);let n,i,s;r++;const c=k[t[1]];let u,d,p;if(c){if(t[0].match(/:/)){for(d=34,s=new h(t[0]),n=m.aton6(s.startAddress().correctForm()),i=m.aton6(s.endAddress().correctForm()),u=Buffer.alloc(d),p=0;p<n.length;p++)u.writeUInt32BE(n[p],4*p);for(p=0;p<i.length;p++)u.writeUInt32BE(i[p],16+4*p)}else d=10,s=new w(t[0]),n=parseInt(s.startAddress().bigInteger(),10),i=parseInt(s.endAddress().bigInteger(),10),u=Buffer.alloc(d),u.fill(0),u.writeUInt32BE(n,0),u.writeUInt32BE(i,4);u.write(c,d-2),o.writeSync(a,u,0,d,null),Date.now()-l>5e3&&(l=Date.now(),process.stdout.write('\nStill working ('+r+')...'))}})).on('pipe',(function(){console.log(u.green(' DONE')),n()}))}function q(e,t,n){let r=0;const i=s.join(x,t),c=s.join(E,e);f(i),process.stdout.write('Processing Data (may take a moment) ...');var l=Date.now(),a=o.openSync(i,'w');p(o.createReadStream(c)).lines.map((function(e){return d.decode(e,'latin1')})).skip(1).map((function(e){if(e.match(/^Copyright/)||!e.match(/\d/))return;const t=R(e);if(!t)return void console.warn('weird line: %s::',e);let n,i,s,c,u,d,p,f,g,y;if(r++,t[0].match(/:/)){let e=0;for(d=48,s=new h(t[0]),n=m.aton6(s.startAddress().correctForm()),i=m.aton6(s.endAddress().correctForm()),c=parseInt(t[1],10),c=I[c],u=Buffer.alloc(d),u.fill(0),y=0;y<n.length;y++)u.writeUInt32BE(n[y],e),e+=4;for(y=0;y<i.length;y++)u.writeUInt32BE(i[y],e),e+=4;u.writeUInt32BE(c>>>0,32),p=Math.round(1e4*parseFloat(t[7])),f=Math.round(1e4*parseFloat(t[8])),g=parseInt(t[9],10),u.writeInt32BE(p,36),u.writeInt32BE(f,40),u.writeInt32BE(g,44)}else d=24,s=new w(t[0]),n=parseInt(s.startAddress().bigInteger(),10),i=parseInt(s.endAddress().bigInteger(),10),c=parseInt(t[1],10),c=I[c],u=Buffer.alloc(d),u.fill(0),u.writeUInt32BE(n>>>0,0),u.writeUInt32BE(i>>>0,4),u.writeUInt32BE(c>>>0,8),p=Math.round(1e4*parseFloat(t[7])),f=Math.round(1e4*parseFloat(t[8])),g=parseInt(t[9],10),u.writeInt32BE(p,12),u.writeInt32BE(f,16),u.writeInt32BE(g,20);o.writeSync(a,u,0,u.length,null),Date.now()-l>5e3&&(l=Date.now(),process.stdout.write('\nStill working ('+r+')...'))})).on('pipe',n)}function L(e,t){if(e.skip)return t(null,e);const n=e.type,r=e.src,i=e.dest;'country'===n?Array.isArray(r)?function(e,t){const n=s.join(E,e);process.stdout.write('Processing Lookup Data (may take a moment)...'),p(o.createReadStream(n)).lines.map((function(e){return d.decode(e,'latin1')})).skip(1).map((function(e){const t=R(e);!t||t.length<6?console.log('weird line: %s::',e):k[t[0]]=t[4]})).on('pipe',(function(){console.log(u.green(' DONE')),t()}))}(r[0],(function(){O(r[1],i[1],(function(){O(r[2],i[2],(function(){t(null,e)}))}))})):O(r,i,(function(){t(null,e)})):'city'===n&&function(e,t,n){let r=null,i=0;const c=s.join(x,t),l=s.join(E,e);f(c);var a=o.openSync(c,'w');p(o.createReadStream(l)).lines.map((function(e){return d.decode(e,'utf-8')})).skip(1).map((function(e){if(e.match(/^Copyright/)||!e.match(/\d/))return;const t=Buffer.alloc(88),n=R(e);if(!n)return void console.warn('weird line: %s::',e);r=parseInt(n[0]),I[r]=i;const s=n[4],c=n[6],l=n[10],u=parseInt(n[11]),d=n[12],p=n[13];t.fill(0),t.write(s,0),t.write(c,2),u&&t.writeInt32BE(u,5),t.write(p,9),t.write(d,10),t.write(l,42),o.writeSync(a,t,0,t.length,null),i++})).on('pipe',n)}(r[0],i[0],(function(){q(r[1],i[1],(function(){console.log('city data processed'),q(r[2],i[2],(function(){console.log(u.green(' DONE')),t(null,e)}))}))}))}function F(e,t){if(e.skip||!e.checkValue)return t();o.writeFile(s.join(x,e.type+'.checksum'),e.checkValue,'utf8',(function(n){n&&console.log(u.red('Failed to Update checksums.'),'Database:',e.type),t()}))}S||(console.error(u.red('ERROR')+': Missing license_key'),process.exit(1)),f(E),C(E),a.eachSeries(D,(function(e,t){a.seq(_,b,A,L,F)(e,t)}),(function(e){e?(console.error(u.red('Failed to Update Databases from MaxMind.'),e),process.exit(1)):(console.log(u.green('Successfully Updated Databases from MaxMind.')),-1!==y.indexOf('debug')?console.log(u.yellow.bold('Notice: temporary files are not deleted for debug purposes.')):f(E),process.exit(0))}));