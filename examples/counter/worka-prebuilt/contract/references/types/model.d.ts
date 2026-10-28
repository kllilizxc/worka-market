import { z } from '@dsh-workbench/runtime';
export declare const note: import("@dsh-workbench/runtime").NoteModel<{
    readonly counters: {
        schema: z.ZodObject<{
            count: z.ZodNumber;
        }, z.core.$strip>;
    };
}, undefined>;
