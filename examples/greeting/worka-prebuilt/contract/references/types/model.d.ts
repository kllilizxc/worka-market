import { z } from '@dsh-workbench/runtime';
export declare const greetingStateSchema: z.ZodObject<{
    name: z.ZodString;
}, z.core.$strip>;
export declare const note: import("@dsh-workbench/runtime").NoteModel<{}, undefined, {}, z.ZodObject<{
    name: z.ZodString;
}, z.core.$strip>, {}>;
