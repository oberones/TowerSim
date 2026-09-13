import { expect,test } from 'vitest';
import { keyboardAction } from '../../src/input/keyboard';

test('tool and time shortcuts respect text entry, native buttons, modifiers and dialogs',()=>{
 expect(keyboardAction({key:'F'})).toEqual({kind:'tool',id:'floor'});
 expect(keyboardAction({key:'f',editable:true})).toBeNull();
 expect(keyboardAction({key:'i',control:true})).toBeNull();
 expect(keyboardAction({key:'Escape',dialog:true})).toBeNull();
 expect(keyboardAction({key:'Escape',editable:true})).toEqual({kind:'cancel'});
 expect(keyboardAction({key:' ',interactive:true})).toBeNull();
 expect(keyboardAction({key:' ',repeat:true})).toBeNull();
 expect(keyboardAction({key:'3'})).toEqual({kind:'speed',speed:8});
});
