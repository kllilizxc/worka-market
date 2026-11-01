import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseJsonl,validateCatalog } from './validate.mjs';
const row={schemaVersion:4,kind:'note',id:'author/item',author:'author',name:'Item',description:'Example',repository:'https://github.com/author/notes',path:'items/example'};
test('accepts a link to a package folder and rejects pins, mirrors, unsafe paths and duplicate listings',()=>{
  validateCatalog(parseJsonl(JSON.stringify(row)+'\n'));
  for (const edit of [{schemaVersion:3},{repository:row.repository+'/tree/main'},{path:'../bad'},{artifact:{}},{version:'1.0.0'},{blocked:true},{locales:{en:{name:'Missing description'}}}]) assert.throws(()=>validateCatalog([{...row,...edit}]));
  assert.throws(()=>validateCatalog([row,row]));
});
