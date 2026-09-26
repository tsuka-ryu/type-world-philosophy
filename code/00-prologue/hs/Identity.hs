-- 自由定理の例。forall a. a -> a を満たす全域関数は恒等関数しかない。
module Identity where

identity :: a -> a
identity x = x
