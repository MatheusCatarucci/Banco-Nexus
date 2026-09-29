import { Sala } from "./models/sala_model";

export async function consultarSalas(): Promise<Sala[]> {
    const resposta = await fetch("http://127.0.0.1:8000/salas");

    const resposta_json: Sala[] = await resposta.json();

    return resposta_json;
}