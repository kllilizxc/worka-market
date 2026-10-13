import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateCatalog, parseSource, parseJsonl, legacyCatalog } from './validate.mjs';
const source='https://github.com/example/notes/tree/'+ 'a'.repeat(40) +'/template';
const entry={schemaVersion:2,kind:'note',id:'example/note',name:'Note',author:'Example',description:'A note',source};
test('JSONL supports notes and desktops with stable unique IDs',async()=>{
 const entries=parseJsonl(JSON.stringify(entry)+'\n'+JSON.stringify({...entry,id:'example/desk',kind:'desktop'})+'\n');
 await validateCatalog(entries);
 assert.equal(entries.length,2);
 assert.equal(legacyCatalog(entries).notes.length,1);
 await assert.rejects(validateCatalog([entry,entry]),/Duplicate/);
});
test('rejects malformed lines, unknown versions, fields, kinds and moving sources',async()=>{
 assert.throws(()=>parseJsonl(JSON.stringify(entry)+'\n{bad'),/line 2/);
 for(const row of [{...entry,schemaVersion:3},{...entry,kind:'plugin'},{...entry,token:'unwanted'},{...entry,name:' '},{...entry,source:'https://github.com/example/notes/tree/main/template'}]) await assert.rejects(validateCatalog([row]));
});
test('rejects credential URLs, disallowed origins and escaping assets',async()=>{
 assert.throws(()=>parseSource('https://user:secret@github.com/a/b'));
 assert.throws(()=>parseSource('https://elsewhere.example/a/b/tree/'+ 'a'.repeat(40)));
 await assert.rejects(validateCatalog([{...entry,screenshots:['assets/../secret.png']}]));
 assert.deepEqual(parseSource(source),{repository:'https://github.com/example/notes',tree:['a'.repeat(40),'template']});
});
