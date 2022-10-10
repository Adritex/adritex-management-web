interface IFetchProps {
    route: string;
    method: "POST" | "GET" | "DELETE";
    body?: string;
    user: any;
}

export async function fetchServer(props: IFetchProps) {
    if (props.method == "GET") {
        const action = await fetch(props.route, {
            method: props.method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + props.user.token
            },
        });

        return await action.json();
    } else {
        const action = await fetch(props.route, {
            method: props.method,
            body: props.body,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + props.user.token
            },
        });

        return await action.json();
    }
}