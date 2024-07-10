import type { FailingRequestHandler, HandleRootRequest, AnyRequestData } from './types'

export function getFailingRequestHandler(): FailingRequestHandler{
    const failingTypes: AnyRequestData['type'][] = [];

    function makeRequestFail(type: AnyRequestData['type']): void{
        failingTypes.push(type);
    }
    function createHandler(rootRequestHandler: HandleRootRequest): HandleRootRequest{
        return (data: AnyRequestData) => {
            if(failingTypes.some(t => data.type === t)){
                throw new Error(`Request of type ${data.type} has failed`)
            }
            return rootRequestHandler(data);
        }
    }
    return { makeRequestFail, createHandler };
}