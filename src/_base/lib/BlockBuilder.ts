/**
 * BlockBuilder & CategoryBuilder - Utilitários para Definição do Toolbox.
 * 
 * Estas classes fornecem uma "Fluent API" para construir o JSON de definição 
 * do toolbox do Blockly de forma programática. Isso evita o uso de objetos 
 * aninhados complexos e melhora a legibilidade ao configurar categorias e blocos.
 */
export class BlockBuilder {
    private toolboxJson: any;

    constructor(type: string) {
        this.toolboxJson = {
            kind: "block",
            type: type,
        };
    }

    withField(fieldName: string, value: any): BlockBuilder {
        if (!this.toolboxJson.fields) {
            this.toolboxJson.fields = {};
        }
        this.toolboxJson.fields[fieldName] = value;
        return this;
    }

    withShadowStatement(inputName: string, shadowBlock: BlockBuilder): BlockBuilder {
        if (!this.toolboxJson.inputs) {
            this.toolboxJson.inputs = {};
        }
        this.toolboxJson.inputs[inputName] = shadowBlock.toJSON();
        return this;
    }

    asShadow(): BlockBuilder {
        this.toolboxJson.kind = "shadow";
        return this;
    }

    withShadowValue(inputName: string, shadowBlock: BlockBuilder): BlockBuilder {
        if (!this.toolboxJson.inputs) {
            this.toolboxJson.inputs = {};
        }
        this.toolboxJson.inputs[inputName] = {
            shadow: shadowBlock.toJSON(),
        };
        return this;
    }

    toJSON(): any {
        return this.toolboxJson;
    }
}

export function shadowNum(value: number): BlockBuilder {
    return new BlockBuilder('math_number').asShadow().withField('NUM', value);
}

export function shadowText(value: string): BlockBuilder {
    return new BlockBuilder('text').asShadow().withField('TEXT', value);
}

export function shadowBlock(type: string, fieldName: string, value: any): BlockBuilder {
    return new BlockBuilder(type).asShadow().withField(fieldName, value);
}

export class CategoryBuilder {
    private name: string;
    private color: string;
    private custom: string | null;
    private blocks: BlockBuilder[] = [];

    constructor(name: string, color: string, custom: string | null = null) {
        this.name = name;
        this.color = color;
        this.custom = custom;
    }

    addBlock(block: BlockBuilder): void {
        this.blocks.push(block);
    }

    toJSON(): any {
        const jsonBlocks = this.blocks.map(block => block.toJSON());
        const categoryDef: any = {
            kind: "category",
            name: this.name,
            colour: this.color,
        };

        if (this.custom) {
            categoryDef.custom = this.custom;
        } else {
            categoryDef.contents = jsonBlocks;
        }

        return categoryDef;
    }
}
