import { Enum } from 'typescript-string-enums';
declare const CoinsGain: {
    none: "none";
    small: "small";
    medium: "medium";
    big: "big";
    huge: "huge";
};
declare type CoinsGain = Enum<typeof CoinsGain>;
interface AdventureArchetype {
    hid: string;
    good: boolean;
    post: {
        gains: {
            level: boolean;
            agility: number;
            health: number;
            luck: number;
            mana: number;
            strength: number;
            vitality: number;
            wisdom: number;
            coins: CoinsGain;
            tokens: number;
            armor: boolean;
            weapon: boolean;
            armor_improvement: boolean;
            weapon_improvement: boolean;
        };
    };
}
export { CoinsGain, AdventureArchetype };