import { z } from '@dsh-workbench/runtime';
export declare const note: import("@dsh-workbench/runtime").NoteModel<{
    readonly items: {
        schema: z.ZodObject<{
            text: z.ZodString;
            done: z.ZodBoolean;
        }, z.core.$strip>;
    };
}, undefined>;
