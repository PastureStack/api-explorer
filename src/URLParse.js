function URLParse()
{
}

URLParse.updateQuery = function(url,assoc)
{
  var hashPos = url.indexOf('#');
  var hash = hashPos >= 0 ? url.substr(hashPos) : '';
  var urlWithoutHash = hashPos >= 0 ? url.substr(0, hashPos) : url;
  var parts = urlWithoutHash.split('?',2);
  var base = parts[0];
  var query = URLParse.queryStringToAssoc(parts[1]||'');

  var v;
  for ( var k in assoc )
  {
    if ( !assoc.hasOwnProperty(k) )
    {
      continue;
    }

    v = assoc[k];
    URLParse.setQueryEntry(query, k, v);
  }

  var out = base + URLParse.assocToQueryString(query) + hash;
  return out;
}

URLParse.parse = function(url)
{
/**
 * See: https://gist.github.com/1847816
 * Parse a URI, returning an object similar to window.location
 */

  var res = {};

  var a = document.createElement('a');
  a.href = url;

  var keys = ['protocol','hostname','host','pathname','port','search','hash','href'];
  var i, k, v;
  for (i = 0 ; i < keys.length ; i++ )
  {
    k = keys[i];
    v = a[k];

    if ( k == 'pathname' && v.substr(0,1) != '/' )
    {
      v = '/' + v; // IE doesn't put a leading slash on pathnames of A-tags, but does on window.location
    }

    res[k] = v;
  }

  res.toString = function() { return anchor.href; };
  res.requestUri = res.pathname + res.search;  
  return res;
}

URLParse.queryStringToAssoc = function(qs)
{
  if (qs.length == 0)
    return [];

  // Ignore ?
  qs = qs.replace(/^\?/,'');

  // Turn <plus> back to <space>
  qs = qs.replace(/\+/g, ' ')

  // parse out name/value pairs separated via &
  var args = qs.split('&')

  // split out each name=value pair
  var pair, name, value;
  var qs_assoc = [];
  for (var i=0 ; i < args.length ; i++ )
  {
    var separator = args[i].indexOf('=');
    pair = separator < 0 ? [args[i]] : [args[i].substr(0, separator), args[i].substr(separator + 1)];
    try
    {
      name = decodeURIComponent(pair[0]);
      value = pair.length == 2 ? decodeURIComponent(pair[1]) : '';
    }
    catch (e)
    {
      // Ignore malformed percent-encoding instead of interpreting a partial key.
      continue;
    }

    var isArray = /\[\]$/.test(name);
    if ( isArray )
      name = name.replace(/\[\]$/, '');

    if ( URLParse.isUnsafeQueryKey(name) )
      continue;

    var existingIndex = URLParse.queryEntryIndex(qs_assoc, name);
    if ( isArray )
    {
      if ( existingIndex < 0 )
      {
        qs_assoc.push({name: name, value: [value]});
      }
      else if ( Array.isArray(qs_assoc[existingIndex].value) )
      {
        qs_assoc[existingIndex].value.push(value);
      }
      else
      {
        qs_assoc[existingIndex].value = [qs_assoc[existingIndex].value, value];
      }
    }
    else
    {
      if ( existingIndex < 0 )
        qs_assoc.push({name: name, value: value});
      else
        qs_assoc[existingIndex].value = value;
    }
  }

  return qs_assoc;
}

URLParse.assocToQueryString = function(assoc)
{
  var ret = '';

  for ( var i = 0 ; i < assoc.length ; i++ )
  {
    var entry = assoc[i];
    if ( !entry || URLParse.isUnsafeQueryKey(entry.name) )
      continue;

    var values = Array.isArray(entry.value) ? entry.value : [entry.value];
    for ( var valueIndex = 0 ; valueIndex < values.length ; valueIndex++ )
    {
      var suffix = Array.isArray(entry.value) ? '[]' : '';
      ret += (ret ? '&' : '?') + encodeURIComponent(entry.name + suffix) + '=' + encodeURIComponent(values[valueIndex]);
    }
  }

  return ret;
}

URLParse.isUnsafeQueryKey = function(name)
{
  return name === '__proto__' || name === 'prototype' || name === 'constructor';
}

URLParse.queryEntryIndex = function(assoc,name)
{
  for ( var i = 0 ; i < assoc.length ; i++ )
  {
    if ( assoc[i].name === name )
      return i;
  }

  return -1;
}

URLParse.setQueryEntry = function(assoc,name,value)
{
  if ( URLParse.isUnsafeQueryKey(name) )
    return;

  var index = URLParse.queryEntryIndex(assoc, name);
  if ( value === null )
  {
    if ( index >= 0 )
      assoc.splice(index, 1);
  }
  else if ( index >= 0 )
  {
    assoc[index].value = value;
  }
  else
  {
    assoc.push({name: name, value: value});
  }
}

URLParse.generateHash = function(length,which)
{
  length = length || 12;
  which = which || 'full';

  var chars;
  if ( which == 'hex' )
    chars = '0123456789abcdef';
  else
    chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234556789';

  var str = "";
  for ( var i = 0 ; i < length ; i++ )
    str += chars.substr( Math.floor(Math.random()*chars.length), 1 );

  return str;
}

if ( typeof module === 'object' && module.exports )
  module.exports = URLParse;
