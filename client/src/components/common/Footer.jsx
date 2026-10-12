import React from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../../utils/constants';
import SmartCartLogo from './SmartCartLogo';

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-[#e3e5df] bg-[#f7f7f4]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="sm:col-span-2">
          <Link to="/" aria-label="SmartCart home"><SmartCartLogo /></Link>
          <p className="mt-2 max-w-sm text-sm leading-6 text-[#6b716b]">
            A straightforward place to browse electronics, compare specifications and keep track of products you like.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-[#303a32]">Shop</h2>
          <ul className="mt-3 space-y-2 text-sm text-[#6b716b]">
            <li><Link to="/catalog" className="hover:text-[#315740]">All products</Link></li>
            {CATEGORIES.slice(0, 3).map((category) => <li key={category.id}><Link to={`/catalog?category=${category.id}`} className="hover:text-[#315740]">{category.name}</Link></li>)}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-[#303a32]">Tools</h2>
          <ul className="mt-3 space-y-2 text-sm text-[#6b716b]">
            <li><Link to="/smart-finder" className="hover:text-[#315740]">Find by budget</Link></li>
            <li><Link to="/compare" className="hover:text-[#315740]">Compare products</Link></li>
            <li><Link to="/wishlist" className="hover:text-[#315740]">Wishlist</Link></li>
            <li><Link to="/cart" className="hover:text-[#315740]">Cart</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[#e3e5df]">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 text-xs text-[#858b84] sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} SmartCart</span>
          <span>Catalog prices are shown in INR.</span>
        </div>
      </div>
    </footer>
  );
}
