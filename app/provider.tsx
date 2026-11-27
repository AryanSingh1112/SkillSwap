"use client"

import { ConvexProvider, ConvexReactClient } from 'convex/react';
import React, { useMemo } from 'react'

import { ReactNode } from 'react';

const Provider = ({ children }: { children: ReactNode }) => {

    // One client per mount; recreating it each render drops the websocket and subscriptions.
    const convex = useMemo(() => new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!), []);

    return (
        <div>
            <ConvexProvider client={convex}>{children}</ConvexProvider>
        </div>
    )
}

export default Provider